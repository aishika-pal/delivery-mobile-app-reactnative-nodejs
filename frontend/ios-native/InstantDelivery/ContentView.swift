import SwiftUI

struct ContentView: View {
    @State private var searchText = ""
    let categories = [
        ("Food", "🍔"),
        ("Groceries", "🛒"),
        ("Medicines", "💊"),
        ("Healthcare & Wellness Products", "🩺")
    ]
    
    var body: some View {
        VStack {
            Spacer()
            VStack(spacing: 8) {
                Text("Instant Delivery")
                    .font(.system(size: 32, weight: .bold))
                    .foregroundColor(.primary)
                Text("Get anything delivered within minutes")
                    .font(.system(size: 16))
                    .foregroundColor(.secondary)
            }
            .padding(.top, 40)
            Spacer()
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 24) {
                ForEach(categories, id: \.(0)) { cat in
                    VStack {
                        Text(cat.1)
                            .font(.system(size: 48))
                        Text(cat.0)
                            .font(.headline)
                    }
                    .frame(maxWidth: .infinity, minHeight: 100)
                    .background(Color(.systemGray6))
                    .cornerRadius(16)
                }
            }
            .padding(.horizontal)
            Spacer()
            HStack {
                TextField("Search for food, groceries, medicines...", text: $searchText)
                    .padding(16)
                    .background(Color(.systemGray6))
                    .cornerRadius(30)
            }
            .padding(.horizontal)
            .padding(.bottom, 20)
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
            .previewDevice("iPhone 14 Pro")
        ContentView()
            .previewDevice("iPad Pro (12.9-inch) (6th generation)")
    }
}
