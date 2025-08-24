/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = config => ({
  type: "widget",
  icon: 'https://github.com/expo.png',
  // ActivityKit requires iOS 16.1+
  deploymentTarget: "16.1",
  // Needed for Live Activities UI
  frameworks: ["SwiftUI", "WidgetKit", "ActivityKit"],
  entitlements: { /* Add entitlements if needed (e.g., app groups) */ },
});