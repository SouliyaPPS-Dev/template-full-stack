import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/models.dart';
import '../../../core/api_service.dart';
import '../../../core/config.dart';
import '../../../shared/breakpoints.dart';
import '../../cart/providers/cart_provider.dart';

class ProductDetailScreen extends ConsumerStatefulWidget {
  final String productId;
  const ProductDetailScreen({super.key, required this.productId});

  @override
  ConsumerState<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends ConsumerState<ProductDetailScreen> {
  int _selectedImage = 0;
  int _quantity = 1;
  late Future<Product> _productFuture;

  @override
  void initState() {
    super.initState();
    _productFuture = ApiService.getProduct(widget.productId);
  }

  @override
  Widget build(BuildContext context) {
    final isWide = AppBreakpoints.isDesktop(context);

    return FutureBuilder<Product>(
      future: _productFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return Scaffold(
            appBar: AppBar(title: const Text('Product')),
            body: const Center(child: CircularProgressIndicator()),
          );
        }
        if (snapshot.hasError) {
          return Scaffold(
            appBar: AppBar(title: const Text('Product')),
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline, size: 48, color: Colors.red),
                  const SizedBox(height: 16),
                  Text('Failed to load product'),
                  const SizedBox(height: 16),
                  FilledButton(
                    onPressed: () => setState(() {
                      _productFuture = ApiService.getProduct(widget.productId);
                    }),
                    child: const Text('Retry'),
                  ),
                ],
              ),
            ),
          );
        }

        final product = snapshot.data!;
        return Scaffold(
          appBar: AppBar(
            title: Text(product.name),
            actions: [
              IconButton(
                icon: const Icon(Icons.share),
                onPressed: () {},
              ),
            ],
          ),
          body: isWide ? _buildWideLayout(context, product) : _buildNarrowLayout(context, product),
          bottomNavigationBar: _buildBottomBar(context, product),
        );
      },
    );
  }

  Widget _buildWideLayout(BuildContext context, Product product) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(flex: 3, child: _buildImageGallery(context, product)),
        const VerticalDivider(width: 1),
        Expanded(flex: 2, child: _buildProductInfo(context, product)),
      ],
    );
  }

  Widget _buildNarrowLayout(BuildContext context, Product product) {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildImageGallery(context, product),
          _buildProductInfo(context, product),
        ],
      ),
    );
  }

  Widget _buildImageGallery(BuildContext context, Product product) {
    return Column(
      children: [
        AspectRatio(
          aspectRatio: isWide(context) ? 1.0 : 4 / 3,
          child: Container(
            width: double.infinity,
            color: Colors.grey.shade100,
            child: product.images.isNotEmpty
                ? Image.network(
                    product.images[_selectedImage.clamp(0, product.images.length - 1)],
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => const Center(
                      child: Icon(Icons.image, size: 64, color: Colors.grey),
                    ),
                  )
                : const Center(
                    child: Icon(Icons.image, size: 64, color: Colors.grey),
                  ),
          ),
        ),
        if (product.images.length > 1)
          SizedBox(
            height: 80,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
              itemCount: product.images.length,
              itemBuilder: (context, index) {
                final isSelected = _selectedImage == index;
                return GestureDetector(
                  onTap: () => setState(() => _selectedImage = index),
                  child: Container(
                    width: 64,
                    height: 64,
                    margin: const EdgeInsets.only(right: 8),
                    decoration: BoxDecoration(
                      border: Border.all(
                        color: isSelected
                            ? Theme.of(context).colorScheme.primary
                            : Colors.grey.shade300,
                        width: isSelected ? 2 : 1,
                      ),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    clipBehavior: Clip.antiAlias,
                    child: Image.network(
                      product.images[index],
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => const Icon(Icons.image, size: 24),
                    ),
                  ),
                );
              },
            ),
          ),
      ],
    );
  }

  Widget _buildProductInfo(BuildContext context, Product product) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (product.onSale)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.red.shade50,
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                '-${product.discountPercent.toStringAsFixed(0)}% OFF',
                style: TextStyle(color: Colors.red.shade700, fontWeight: FontWeight.bold, fontSize: 12),
              ),
            ),
          const SizedBox(height: 8),
          Text(product.name, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Row(
            children: [
              Text(
                '$currencySymbol ${product.sellingPrice.toStringAsFixed(0)}',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: Theme.of(context).colorScheme.primary,
                ),
              ),
              if (product.onSale) ...[
                const SizedBox(width: 12),
                Text(
                  '$currencySymbol ${product.comparePrice.toStringAsFixed(0)}',
                  style: const TextStyle(
                    fontSize: 16,
                    color: Colors.grey,
                    decoration: TextDecoration.lineThrough,
                  ),
                ),
              ],
            ],
          ),
          const SizedBox(height: 16),
          if (product.sku.isNotEmpty) _infoRow('SKU', product.sku),
          if (product.barcode.isNotEmpty) _infoRow('Barcode', product.barcode),
          _infoRow('Unit', product.unit),
          _infoRow('Stock', product.inStock ? '${product.stock} available' : 'Out of stock'),
          if (product.weight != null) _infoRow('Weight', '${product.weight} kg'),
          const SizedBox(height: 16),
          if (product.description.isNotEmpty) ...[
            const Text('Description', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            Text(product.description, style: TextStyle(color: Colors.grey.shade700, height: 1.5)),
          ],
          if (product.features.isNotEmpty) ...[
            const SizedBox(height: 16),
            const Text('Features', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            ...product.features.entries.map((e) => _infoRow(e.key, '${e.value}')),
          ],
          const SizedBox(height: 80),
        ],
      ),
    );
  }

  Widget _buildBottomBar(BuildContext context, Product product) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).scaffoldBackgroundColor,
        boxShadow: [BoxShadow(color: Colors.black.withAlpha(20), blurRadius: 8, offset: const Offset(0, -2))],
      ),
      child: SafeArea(
        child: Row(
          children: [
            // Quantity
            Container(
              decoration: BoxDecoration(
                border: Border.all(color: Colors.grey.shade300),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.remove, size: 20),
                    onPressed: _quantity > 1 ? () => setState(() => _quantity--) : null,
                  ),
                  Text('$_quantity', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  IconButton(
                    icon: const Icon(Icons.add, size: 20),
                    onPressed: () => setState(() => _quantity++),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 16),
            // Add to Cart
            Expanded(
              child: FilledButton.icon(
                onPressed: product.inStock
                    ? () {
                        ref.read(cartProvider.notifier).addItem(product, quantity: _quantity);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('Added ${product.name} x$_quantity to cart'),
                            action: SnackBarAction(
                              label: 'View Cart',
                              onPressed: () => context.push('/cart'),
                            ),
                          ),
                        );
                      }
                    : null,
                icon: const Icon(Icons.shopping_cart),
                label: const Text('Add to Cart'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  bool isWide(BuildContext context) => AppBreakpoints.isDesktop(context);

  Widget _infoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          SizedBox(
            width: 100,
            child: Text(label, style: const TextStyle(color: Colors.grey)),
          ),
          Expanded(child: Text(value, style: const TextStyle(fontWeight: FontWeight.w500))),
        ],
      ),
    );
  }
}
