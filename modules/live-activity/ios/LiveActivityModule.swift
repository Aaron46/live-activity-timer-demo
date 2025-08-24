import Foundation
import ExpoModulesCore
import ActivityKit

public class LiveActivityModule: Module {
  private let defaultsKey = "LiveActivityId"

  public func definition() -> ModuleDefinition {
    Name("LiveActivity")

    AsyncFunction("startActivity") { (activityName: String) -> String? in
      if #available(iOS 16.1, *) {
        let attributes = TimerAttributes(name: activityName)
        let content = TimerAttributes.ContentState(elapsedSeconds: 0, isPaused: false)
        do {
          let activity = try Activity<TimerAttributes>.request(attributes: attributes, contentState: content)
          let id = activity.id
          UserDefaults.standard.set(id, forKey: self.defaultsKey)
          return id
        } catch {
          return nil
        }
      } else {
        return nil
      }
    }

    AsyncFunction("updateActivity") { (elapsedSeconds: Double?, isPaused: Bool?) -> Bool in
      if #available(iOS 16.1, *) {
        guard let activity = self.findActivity() else { return false }
        let currentState = activity.contentState
        let newElapsed = elapsedSeconds != nil ? Int(elapsedSeconds!) : currentState.elapsedSeconds
        let newPaused = isPaused ?? currentState.isPaused
        let newState = TimerAttributes.ContentState(elapsedSeconds: newElapsed, isPaused: newPaused)
        do {
          try await activity.update(using: newState)
          return true
        } catch {
          return false
        }
      } else {
        return false
      }
    }

    AsyncFunction("pauseActivity") { () -> Bool in
      if #available(iOS 16.1, *) {
        guard let activity = self.findActivity() else { return false }
        let current = activity.contentState
        let newState = TimerAttributes.ContentState(elapsedSeconds: current.elapsedSeconds, isPaused: true)
        do {
          try await activity.update(using: newState)
          return true
        } catch {
          return false
        }
      } else {
        return false
      }
    }

    AsyncFunction("resumeActivity") { () -> Bool in
      if #available(iOS 16.1, *) {
        guard let activity = self.findActivity() else { return false }
        let current = activity.contentState
        let newState = TimerAttributes.ContentState(elapsedSeconds: current.elapsedSeconds, isPaused: false)
        do {
          try await activity.update(using: newState)
          return true
        } catch {
          return false
        }
      } else {
        return false
      }
    }

    AsyncFunction("endActivity") { () -> Bool in
      if #available(iOS 16.1, *) {
        guard let activity = self.findActivity() else { return false }
        let current = activity.contentState
        do {
          try await activity.end(using: current, dismissalPolicy: .immediate)
          UserDefaults.standard.removeObject(forKey: self.defaultsKey)
          return true
        } catch {
          return false
        }
      } else {
        return false
      }
    }

    AsyncFunction("getStatus") { () -> [String: Any]? in
      if #available(iOS 16.1, *) {
        guard let activity = self.findActivity() else { return nil }
        let state = activity.contentState
        return [
          "id": activity.id,
          "elapsedTime": state.elapsedSeconds,
          "state": state.isPaused ? "paused" : "active"
        ]
      } else {
        return nil
      }
    }
  }

  @available(iOS 16.1, *)
  private func findActivity(by id: String? = nil) -> Activity<TimerAttributes>? {
    let targetId = id ?? UserDefaults.standard.string(forKey: defaultsKey)
    if let targetId {
      return Activity<TimerAttributes>.activities.first(where: { $0.id == targetId })
    }
    return Activity<TimerAttributes>.activities.first
  }
}
