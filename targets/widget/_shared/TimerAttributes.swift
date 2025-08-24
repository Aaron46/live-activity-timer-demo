import Foundation
import ActivityKit

public struct TimerAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        public var elapsedSeconds: Int
        public var isPaused: Bool
        public init(elapsedSeconds: Int, isPaused: Bool) {
            self.elapsedSeconds = elapsedSeconds
            self.isPaused = isPaused
        }
    }

    public var name: String
    public init(name: String) {
        self.name = name
    }
}
