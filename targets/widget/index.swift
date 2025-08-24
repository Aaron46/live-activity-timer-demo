import WidgetKit
import SwiftUI

@main
struct exportWidgets: WidgetBundle {
    var body: some Widget {
        // Export widgets here
        widget()
        if #available(iOSApplicationExtension 18.0, *) {
            widgetControl()
        }
        WidgetLiveActivity()
    }
}
