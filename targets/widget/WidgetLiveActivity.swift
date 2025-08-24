import ActivityKit
import WidgetKit
import SwiftUI

// Uses shared attributes defined in _shared/TimerAttributes.swift
// Displays a simple timer for a named activity.

struct WidgetLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: TimerAttributes.self) { context in
            // Lock screen UI
            HStack(spacing: 12) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(context.attributes.name)
                        .font(.headline)
                    Text(context.state.isPaused ? "Paused" : "Running")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Spacer()
                // Show the elapsed time using a date relative style.
                // Convert seconds to a start date.
                let startDate = Date().addingTimeInterval(Double(-context.state.elapsedSeconds))
                Text(startDate, style: .timer)
                    .monospacedDigit()
                    .font(.title3)
            }
            .padding(.horizontal)
            .activityBackgroundTint(Color(.systemBackground))
            .activitySystemActionForegroundColor(Color.accentColor)

        } dynamicIsland: { context in
            DynamicIsland {
                // Expanded UI
                DynamicIslandExpandedRegion(.leading) {
                    VStack(alignment: .leading) {
                        Text(context.attributes.name)
                            .font(.caption)
                            .lineLimit(1)
                        Text(context.state.isPaused ? "Paused" : "Running")
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                    }
                }
                DynamicIslandExpandedRegion(.trailing) {
                    let startDate = Date().addingTimeInterval(Double(-context.state.elapsedSeconds))
                    Text(startDate, style: .timer)
                        .monospacedDigit()
                }
                DynamicIslandExpandedRegion(.bottom) {
                    ProgressView(value: min(1.0, Double(context.state.elapsedSeconds % 60) / 60.0))
                }
            } compactLeading: {
                Image(systemName: context.state.isPaused ? "pause.fill" : "play.fill")
            } compactTrailing: {
                let startDate = Date().addingTimeInterval(Double(-context.state.elapsedSeconds))
                Text(startDate, style: .timer)
            } minimal: {
                Image(systemName: context.state.isPaused ? "pause.fill" : "play.fill")
            }
            .widgetURL(URL(string: "https://www.expo.dev"))
            .keylineTint(Color.accentColor)
        }
    }
}
