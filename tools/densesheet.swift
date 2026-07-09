// Dichtes Sampling EINES Videos: Frames alle N Sekunden als Raster (4 Spalten),
// jede Kachel mit Sekunden-Label. Aufruf: swift densesheet.swift out.jpg video stepSeconds
import AVFoundation
import AppKit

let args = CommandLine.arguments
guard args.count == 4, let step = Double(args[3]) else { print("usage: densesheet.swift out.jpg video step"); exit(1) }
let url = URL(fileURLWithPath: args[2])
let asset = AVURLAsset(url: url)
let gen = AVAssetImageGenerator(asset: asset)
gen.appliesPreferredTrackTransform = true
gen.requestedTimeToleranceBefore = .init(seconds: 0.3, preferredTimescale: 600)
gen.requestedTimeToleranceAfter = .init(seconds: 0.3, preferredTimescale: 600)

let sem = DispatchSemaphore(value: 0)
var dur = CMTime.zero
Task { dur = (try? await asset.load(.duration)) ?? .zero; sem.signal() }
sem.wait()
let d = CMTimeGetSeconds(dur)

let thumbH: CGFloat = 170
var tiles: [(NSImage, String)] = []
var t = 0.0
while t < d {
    if let cg = try? gen.copyCGImage(at: CMTime(seconds: t, preferredTimescale: 600), actualTime: nil) {
        let scale = thumbH / CGFloat(cg.height)
        tiles.append((NSImage(cgImage: cg, size: NSSize(width: CGFloat(cg.width) * scale, height: thumbH)), String(format: "%.0fs", t)))
    }
    t += step
}
guard !tiles.isEmpty else { exit(1) }
let cols = 4
let tileW = tiles.map { $0.0.size.width }.max()!
let labelH: CGFloat = 22
let rows = Int(ceil(Double(tiles.count) / Double(cols)))
let sheet = NSImage(size: NSSize(width: tileW * CGFloat(cols) + 18, height: CGFloat(rows) * (thumbH + labelH + 6)))
sheet.lockFocus()
NSColor.white.setFill()
NSRect(origin: .zero, size: sheet.size).fill()
let attrs: [NSAttributedString.Key: Any] = [.font: NSFont.boldSystemFont(ofSize: 14), .foregroundColor: NSColor.black]
for (i, (img, label)) in tiles.enumerated() {
    let r = i / cols, c = i % cols
    let x = CGFloat(c) * (tileW + 6)
    let yTop = sheet.size.height - CGFloat(r + 1) * (thumbH + labelH + 6)
    img.draw(in: NSRect(x: x, y: yTop, width: img.size.width, height: thumbH))
    label.draw(at: NSPoint(x: x + 2, y: yTop + thumbH + 2), withAttributes: attrs)
}
sheet.unlockFocus()
guard let tiff = sheet.tiffRepresentation, let rep = NSBitmapImageRep(data: tiff),
      let jpg = rep.representation(using: .jpeg, properties: [.compressionFactor: 0.75]) else { exit(1) }
try! jpg.write(to: URL(fileURLWithPath: args[1]))
print("OK \(tiles.count) Frames, Dauer \(Int(d))s → \(args[1])")
