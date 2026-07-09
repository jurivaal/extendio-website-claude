// Posterbild aus Video-Frame: swift poster.swift <video> <out.jpg> <sekunde> <maxKante>
import AVFoundation
import AppKit

let a = CommandLine.arguments
guard a.count == 5, let sec = Double(a[3]), let maxEdge = Double(a[4]) else {
    print("usage: poster.swift video out.jpg sekunde maxKante"); exit(1)
}
let asset = AVURLAsset(url: URL(fileURLWithPath: a[1]))
let gen = AVAssetImageGenerator(asset: asset)
gen.appliesPreferredTrackTransform = true
gen.requestedTimeToleranceBefore = .init(seconds: 0.2, preferredTimescale: 600)
gen.requestedTimeToleranceAfter = .init(seconds: 0.2, preferredTimescale: 600)
guard let cg = try? gen.copyCGImage(at: CMTime(seconds: sec, preferredTimescale: 600), actualTime: nil) else {
    print("Frame nicht lesbar"); exit(1)
}
let scale = min(1.0, maxEdge / Double(max(cg.width, cg.height)))
let w = Int(Double(cg.width) * scale), h = Int(Double(cg.height) * scale)
let ctx = CGContext(data: nil, width: w, height: h, bitsPerComponent: 8, bytesPerRow: 0,
                    space: CGColorSpaceCreateDeviceRGB(),
                    bitmapInfo: CGImageAlphaInfo.noneSkipFirst.rawValue)!
ctx.interpolationQuality = .high
ctx.draw(cg, in: CGRect(x: 0, y: 0, width: w, height: h))
let scaled = ctx.makeImage()!
let rep = NSBitmapImageRep(cgImage: scaled)
try! rep.representation(using: .jpeg, properties: [.compressionFactor: 0.74])!
    .write(to: URL(fileURLWithPath: a[2]))
print("OK \(w)x\(h) → \(a[2])")
