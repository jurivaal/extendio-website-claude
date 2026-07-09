// Kontaktbogen: pro Video 3 Frames (15% / 50% / 85%) nebeneinander als JPEG.
// Aufruf: swift contactsheet.swift <out.jpg> <video1> [video2 ...]
// Ein Bogen = eine Zeile pro Video, Reihenfolge wie übergeben.
import AVFoundation
import AppKit

let args = CommandLine.arguments
guard args.count >= 3 else { print("usage: contactsheet.swift out.jpg video..."); exit(1) }
let outPath = args[1]
let videos = Array(args.dropFirst(2))

let thumbH: CGFloat = 200
var rows: [[NSImage]] = []
var rowLabels: [String] = []

for path in videos {
    let url = URL(fileURLWithPath: path)
    let asset = AVURLAsset(url: url)
    let gen = AVAssetImageGenerator(asset: asset)
    gen.appliesPreferredTrackTransform = true
    gen.requestedTimeToleranceBefore = .init(seconds: 0.5, preferredTimescale: 600)
    gen.requestedTimeToleranceAfter = .init(seconds: 0.5, preferredTimescale: 600)
    let sem = DispatchSemaphore(value: 0)
    var dur = CMTime.zero
    Task { dur = (try? await asset.load(.duration)) ?? .zero; sem.signal() }
    sem.wait()
    let d = CMTimeGetSeconds(dur)
    var imgs: [NSImage] = []
    for frac in [0.15, 0.5, 0.85] {
        let t = CMTime(seconds: d * frac, preferredTimescale: 600)
        if let cg = try? gen.copyCGImage(at: t, actualTime: nil) {
            let scale = thumbH / CGFloat(cg.height)
            let w = CGFloat(cg.width) * scale
            let img = NSImage(cgImage: cg, size: NSSize(width: w, height: thumbH))
            imgs.append(img)
        }
    }
    if !imgs.isEmpty {
        rows.append(imgs)
        rowLabels.append((path as NSString).lastPathComponent)
        FileHandle.standardOutput.write("ROW \(rows.count): \(path)  [\(Int(d))s]\n".data(using: .utf8)!)
    } else {
        FileHandle.standardOutput.write("SKIP (keine Frames): \(path)\n".data(using: .utf8)!)
    }
}

guard !rows.isEmpty else { print("keine Videos lesbar"); exit(1) }
let labelH: CGFloat = 26
let rowW = rows.map { $0.reduce(0) { $0 + $1.size.width + 6 } }.max()!
let totalH = CGFloat(rows.count) * (thumbH + labelH + 8)
let sheet = NSImage(size: NSSize(width: rowW, height: totalH))
sheet.lockFocus()
NSColor.white.setFill()
NSRect(x: 0, y: 0, width: rowW, height: totalH).fill()
let attrs: [NSAttributedString.Key: Any] = [.font: NSFont.boldSystemFont(ofSize: 16), .foregroundColor: NSColor.black]
for (i, imgs) in rows.enumerated() {
    let yTop = totalH - CGFloat(i + 1) * (thumbH + labelH + 8)
    var x: CGFloat = 0
    for img in imgs {
        img.draw(in: NSRect(x: x, y: yTop, width: img.size.width, height: thumbH))
        x += img.size.width + 6
    }
    ("ROW \(i + 1): " + rowLabels[i]).draw(at: NSPoint(x: 4, y: yTop + thumbH + 4), withAttributes: attrs)
}
sheet.unlockFocus()
guard let tiff = sheet.tiffRepresentation, let rep = NSBitmapImageRep(data: tiff),
      let jpg = rep.representation(using: .jpeg, properties: [.compressionFactor: 0.8]) else { exit(1) }
try! jpg.write(to: URL(fileURLWithPath: outPath))
print("Kontaktbogen: \(outPath)")
