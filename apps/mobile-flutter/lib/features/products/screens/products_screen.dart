import 'package:flutter/material.dart';

class ProductsScreen extends StatelessWidget {
  const ProductsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Products")),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: 2,
        itemBuilder: (context, index) {
          return Card(
            margin: const EdgeInsets.only(bottom: 12),
            child: ListTile(
              leading: Container(
                width: 56,
                height: 56,
                color: Colors.grey[200],
                child: const Icon(Icons.image),
              ),
              title: Text("Product ${index + 1}"),
              subtitle: Text("${(index + 1) * 250000} LAK"),
              trailing: IconButton(
                icon: const Icon(Icons.add_shopping_cart),
                onPressed: () {},
              ),
            ),
          );
        },
      ),
    );
  }
}
