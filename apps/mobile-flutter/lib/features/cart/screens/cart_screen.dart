import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/config.dart';
import '../providers/cart_provider.dart';

class CartScreen extends ConsumerWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cart = ref.watch(cartProvider);
    final width = MediaQuery.sizeOf(context).width;
    final isWide = width >= 1024;

    return Scaffold(
      appBar: AppBar(
        title: Text('Cart (${cart.itemCount})'),
        actions: [
          if (!cart.isEmpty)
            IconButton(
              icon: const Icon(Icons.delete_sweep),
              tooltip: 'Clear cart',
              onPressed: () {
                showDialog(
                  context: context,
                  builder: (ctx) => AlertDialog(
                    title: const Text('Clear Cart'),
                    content: const Text('Remove all items from cart?'),
                    actions: [
                      TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
                      FilledButton(
                        onPressed: () {
                          ref.read(cartProvider.notifier).clear();
                          Navigator.pop(ctx);
                        },
                        child: const Text('Clear'),
                      ),
                    ],
                  ),
                );
              },
            ),
        ],
      ),
      body: cart.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.shopping_cart_outlined, size: 80, color: Colors.grey.shade300),
                  const SizedBox(height: 16),
                  const Text('Your cart is empty', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Text('Browse products and add items', style: TextStyle(color: Colors.grey.shade500)),
                  const SizedBox(height: 24),
                  FilledButton.icon(
                    onPressed: () => context.go('/products'),
                    icon: const Icon(Icons.store),
                    label: const Text('Browse Products'),
                  ),
                ],
              ),
            )
          : isWide ? _buildWideLayout(context, ref, cart) : _buildNarrowLayout(context, ref, cart),
    );
  }

  Widget _buildWideLayout(BuildContext context, WidgetRef ref, CartState cart) {
    return Row(
      children: [
        Expanded(flex: 3, child: _buildCartList(context, ref, cart)),
        const VerticalDivider(width: 1),
        SizedBox(width: 340, child: _buildSummary(context, ref, cart)),
      ],
    );
  }

  Widget _buildNarrowLayout(BuildContext context, WidgetRef ref, CartState cart) {
    return Column(
      children: [
        Expanded(child: _buildCartList(context, ref, cart)),
        _buildSummary(context, ref, cart),
      ],
    );
  }

  Widget _buildCartList(BuildContext context, WidgetRef ref, CartState cart) {
    final isCompact = MediaQuery.sizeOf(context).width < 400;

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: cart.items.length,
      separatorBuilder: (_, __) => const Divider(height: 1),
      itemBuilder: (context, index) {
        final item = cart.items[index];
        return ListTile(
          contentPadding: const EdgeInsets.symmetric(vertical: 8),
          leading: ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: Container(
              width: isCompact ? 48 : 64,
              height: isCompact ? 48 : 64,
              color: Colors.grey.shade100,
              child: item.product.images.isNotEmpty
                  ? Image.network(item.product.images.first, fit: BoxFit.cover)
                  : const Icon(Icons.image, color: Colors.grey),
            ),
          ),
          title: Text(item.product.name, maxLines: 2, overflow: TextOverflow.ellipsis),
          subtitle: Text(
            '$currencySymbol ${item.product.sellingPrice.toStringAsFixed(0)} each',
            style: TextStyle(color: Theme.of(context).colorScheme.primary, fontWeight: FontWeight.w500),
          ),
          trailing: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              IconButton(
                icon: const Icon(Icons.remove_circle_outline, size: 20),
                onPressed: () => ref.read(cartProvider.notifier).updateQuantity(
                      item.product.id,
                      item.quantity - 1,
                    ),
              ),
              Text('${item.quantity}', style: const TextStyle(fontWeight: FontWeight.bold)),
              IconButton(
                icon: const Icon(Icons.add_circle_outline, size: 20),
                onPressed: () => ref.read(cartProvider.notifier).updateQuantity(
                      item.product.id,
                      item.quantity + 1,
                    ),
              ),
              if (!isCompact)
                IconButton(
                  icon: Icon(Icons.delete_outline, size: 20, color: Colors.red.shade400),
                  onPressed: () => ref.read(cartProvider.notifier).removeItem(item.product.id),
                ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildSummary(BuildContext context, WidgetRef ref, CartState cart) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).scaffoldBackgroundColor,
        boxShadow: [BoxShadow(color: Colors.black.withAlpha(20), blurRadius: 8, offset: const Offset(0, -2))],
      ),
      child: SafeArea(
        top: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Subtotal'),
                Text('$currencySymbol ${cart.total.toStringAsFixed(0)}'),
              ],
            ),
            const Divider(),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Items'),
                Text('${cart.itemCount}'),
              ],
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Checkout coming soon!')),
                  );
                },
                child: const Text('Proceed to Checkout'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
