// Schneidet einen Ausschnitt aus einem Video: nur Videospur (stumm), H.264,
// optional herunterskaliert, plus Posterbild (JPEG) vom Segmentanfang.
// Aufruf: swift clipexport.swift <in> <out.mp4> <poster.jpg> <startSek> <endSek> <maxKante> <bitrateKbit>
import AVFoundation
import AppKit
import VideoToolbox

let a = CommandLine.arguments
guard a.count == 8, let start = Double(a[4]), let end = Double(a[5]),
      let maxEdge = Double(a[6]), let kbit = Double(a[7]) else {
    print("usage: clipexport.swift in out.mp4 poster.jpg start end maxEdge kbit"); exit(1)
}
let inURL = URL(fileURLWithPath: a[1])
let outURL = URL(fileURLWithPath: a[2])
let posterURL = URL(fileURLWithPath: a[3])
try? FileManager.default.removeItem(at: outURL)

let asset = AVURLAsset(url: inURL)
let sem = DispatchSemaphore(value: 0)
var vtrack: AVAssetTrack?
Task { vtrack = try? await asset.loadTracks(withMediaType: .video).first; sem.signal() }
sem.wait()
guard let track = vtrack else { print("keine Videospur"); exit(1) }

var natSize = CGSize.zero, transform = CGAffineTransform.identity, fps: Float = 30
let sem2 = DispatchSemaphore(value: 0)
Task {
    natSize = (try? await track.load(.naturalSize)) ?? .zero
    transform = (try? await track.load(.preferredTransform)) ?? .identity
    fps = (try? await track.load(.nominalFrameRate)) ?? 30
    sem2.signal()
}
sem2.wait()

/* Zielgröße: gespeicherte Orientierung beibehalten, längste Kante auf maxEdge begrenzen (gerade Zahlen) */
let scale = min(1.0, maxEdge / Double(max(natSize.width, natSize.height)))
let outW = Int(natSize.width * scale / 2) * 2
let outH = Int(natSize.height * scale / 2) * 2

let reader = try! AVAssetReader(asset: asset)
reader.timeRange = CMTimeRange(start: CMTime(seconds: start, preferredTimescale: 600),
                               end: CMTime(seconds: end, preferredTimescale: 600))
let rout = AVAssetReaderTrackOutput(track: track, outputSettings: [
    kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_420YpCbCr8BiPlanarVideoRange
])
rout.alwaysCopiesSampleData = false
reader.add(rout)

let writer = try! AVAssetWriter(outputURL: outURL, fileType: .mp4)
let winput = AVAssetWriterInput(mediaType: .video, outputSettings: [
    AVVideoCodecKey: AVVideoCodecType.h264,
    AVVideoWidthKey: outW,
    AVVideoHeightKey: outH,
    AVVideoCompressionPropertiesKey: [
        AVVideoAverageBitRateKey: Int(kbit * 1000),
        AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
        AVVideoExpectedSourceFrameRateKey: Int(fps),
        AVVideoMaxKeyFrameIntervalKey: Int(fps * 2)
    ]
])
winput.expectsMediaDataInRealTime = false
winput.transform = transform /* Rotations-Metadaten übernehmen (Hochformat bleibt Hochformat) */

/* Skalierung über PixelBufferAdaptor + vImage wäre aufwendig — einfacher: CoreImage */
let adaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: winput, sourcePixelBufferAttributes: [
    kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_420YpCbCr8BiPlanarVideoRange,
    kCVPixelBufferWidthKey as String: outW,
    kCVPixelBufferHeightKey as String: outH
])
writer.add(winput)

let ciCtx = CIContext()
reader.startReading()
writer.startWriting()
writer.startSession(atSourceTime: CMTime(seconds: start, preferredTimescale: 600))

let queue = DispatchQueue(label: "export")
let done = DispatchSemaphore(value: 0)
var frames = 0
winput.requestMediaDataWhenReady(on: queue) {
    while winput.isReadyForMoreMediaData {
        guard reader.status == .reading, let sample = rout.copyNextSampleBuffer() else {
            winput.markAsFinished(); done.signal(); return
        }
        guard let src = CMSampleBufferGetImageBuffer(sample) else { continue }
        let pts = CMSampleBufferGetPresentationTimeStamp(sample)
        if scale < 1.0 {
            var dst: CVPixelBuffer?
            CVPixelBufferPoolCreatePixelBuffer(nil, adaptor.pixelBufferPool!, &dst)
            if let dst = dst {
                let ci = CIImage(cvPixelBuffer: src).transformed(by: .init(scaleX: CGFloat(outW) / natSize.width, y: CGFloat(outH) / natSize.height))
                ciCtx.render(ci, to: dst)
                adaptor.append(dst, withPresentationTime: pts)
            }
        } else {
            adaptor.append(src, withPresentationTime: pts)
        }
        frames += 1
    }
}
done.wait()
let fin = DispatchSemaphore(value: 0)
writer.finishWriting { fin.signal() }
fin.wait()
guard writer.status == .completed else { print("Writer-Fehler: \(String(describing: writer.error))"); exit(1) }

/* Poster vom Segmentanfang */
let gen = AVAssetImageGenerator(asset: asset)
gen.appliesPreferredTrackTransform = true
gen.requestedTimeToleranceBefore = .init(seconds: 0.2, preferredTimescale: 600)
gen.requestedTimeToleranceAfter = .init(seconds: 0.2, preferredTimescale: 600)
if let cg = try? gen.copyCGImage(at: CMTime(seconds: start + 0.1, preferredTimescale: 600), actualTime: nil) {
    let pScale = min(1.0, 700.0 / Double(max(cg.width, cg.height)))
    let pw = Int(Double(cg.width) * pScale), ph = Int(Double(cg.height) * pScale)
    let img = NSImage(cgImage: cg, size: NSSize(width: pw, height: ph))
    let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: pw, pixelsHigh: ph, bitsPerSample: 8,
                               samplesPerPixel: 3, hasAlpha: false, isPlanar: false,
                               colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
    img.draw(in: NSRect(x: 0, y: 0, width: pw, height: ph))
    NSGraphicsContext.restoreGraphicsState()
    try? rep.representation(using: .jpeg, properties: [.compressionFactor: 0.72])?.write(to: posterURL)
}

let size = (try? FileManager.default.attributesOfItem(atPath: outURL.path)[.size] as? Int) ?? 0
print("OK \(frames) Frames, \(outW)x\(outH), \(size ?? 0) Bytes → \(outURL.lastPathComponent)")
