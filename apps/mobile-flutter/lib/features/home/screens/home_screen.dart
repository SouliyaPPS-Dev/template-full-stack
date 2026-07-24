import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/providers.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final settingsAsync = ref.watch(settingsProvider);
    final user = authState.user;
    final width = MediaQuery.sizeOf(context).width;
    final isWide = width >= 1024;
    final isMedium = width >= 600;

    String storeName = 'Template';
    settingsAsync.whenData((settings) {
      final found = settings.where((s) => s.key == 'store_name');
      if (found.isNotEmpty) {
        storeName = found.first.value.replaceAll('"', '');
      }
    });

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            const Icon(Icons.store, size: 24),
            const SizedBox(width: 8),
            Text(storeName),
          ],
        ),
        actions: [
          if (user != null)
            Padding(
              padding: const EdgeInsets.only(right: 8),
              child: CircleAvatar(
                radius: 16,
                backgroundColor: Theme.of(context).colorScheme.primaryContainer,
                child: Text(
                  user.fullName.isNotEmpty ? user.fullName[0].toUpperCase() : '?',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: Theme.of(context).colorScheme.primary,
                  ),
                ),
              ),
            ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(categoriesProvider);
          ref.invalidate(settingsProvider);
          ref.invalidate(productsProvider);
        },
        child: _buildLayout(context, ref, storeName, isWide, isMedium),
      ),
    );
  }

  Widget _buildLayout(BuildContext context, WidgetRef ref, String storeName, bool isWide, bool isMedium) {
    if (isWide) {
      return Row(
        children: [
          Expanded(flex: 2, child: _buildMainContent(context, ref, storeName)),
          const VerticalDivider(width: 1),
          Expanded(flex: 3, child: _buildFeaturedProducts(context, ref)),
        ],
      );
    }
    return CustomScrollView(
      slivers: [
        SliverToBoxAdapter(child: _buildMainContent(context, ref, storeName)),
        SliverToBoxAdapter(child: _buildFeaturedProducts(context, ref)),
      ],
    );
  }

  Widget _buildMainContent(BuildContext context, WidgetRef ref, String storeName) {
    final categoriesAsync = ref.watch(categoriesProvider);
    final width = MediaQuery.sizeOf(context).width;
    final maxWidth = width >= 1440 ? 800.0 : width >= 1024 ? 600.0 : width >= 600 ? 500.0 : width.toDouble();

    return Center(
      child: ConstrainedBox(
        constraints: BoxConstraints(maxWidth: maxWidth),
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            const SizedBox(height: 16),
            Icon(Icons.store, size: 64, color: Theme.of(context).colorScheme.primary),
            const SizedBox(height: 16),
            Text(
              'Welcome to $storeName',
              style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              'Your one-stop e-commerce shop',
              style: TextStyle(fontSize: 16, color: Colors.grey.shade600),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),

            // Quick actions
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                FilledButton.icon(
                  onPressed: () => context.push('/products'),
                  icon: const Icon(Icons.store),
                  label: const Text('Browse Products'),
                ),
                const SizedBox(width: 12),
                OutlinedButton.icon(
                  onPressed: () => context.push('/profile'),
                  icon: const Icon(Icons.person),
                  label: const Text('My Profile'),
                ),
              ],
            ),
            const SizedBox(height: 32),

            // Categories
            const Text('Categories', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            categoriesAsync.when(
              data: (categories) {
                if (categories.isEmpty) {
                  return const Text('No categories yet', style: TextStyle(color: Colors.grey));
                }
                return Wrap(
                  spacing: 10,
                  runSpacing: 10,
                  children: categories.map((cat) => ActionChip(
                    avatar: const Icon(Icons.category, size: 18),
                    label: Text(cat.name),
                    onPressed: () {
                      ref.read(selectedCategoryProvider.notifier).state = cat.id;
                      context.push('/products');
                    },
                  )).toList(),
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Text('Error: $e'),
            ),
            const SizedBox(height: 32),

            // Features
            const Text('Why Shop With Us', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            _featureCard(context, Icons.inventory_2, 'Wide Selection', 'Browse through our curated collection of products.'),
            _featureCard(context, Icons.shopping_cart_checkout, 'Easy Shopping', 'Add items to your cart and checkout in seconds.'),
            _featureCard(context, Icons.local_offer, 'Best Prices', 'Competitive pricing with regular promotions.'),
          ],
        ),
      ),
    );
  }

  Widget _buildFeaturedProducts(BuildContext context, WidgetRef ref) {
    final productsAsync = ref.watch(productsProvider);

    return productsAsync.when(
      data: (products) {
        final featured = products.where((p) => p.isFeatured).toList();
        if (featured.isEmpty) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.storefront, size: 64, color: Colors.grey.shade300),
                  const SizedBox(height: 16),
                  Text('Featured products will appear here', style: TextStyle(color: Colors.grey.shade500)),
                ],
              ),
            ),
          );
        }
        return Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Featured Products', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                  TextButton(
                    onPressed: () => context.push('/products'),
                    child: const Text('View All'),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Expanded(
                child: GridView.builder(
                  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: MediaQuery.sizeOf(context).width >= 1024 ? 3 : 2,
                    childAspectRatio: 0.85,
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                  ),
                  itemCount: featured.length,
                  itemBuilder: (context, index) {
                    final product = featured[index];
                    return Card(
                      clipBehavior: Clip.antiAlias,
                      child: InkWell(
                        onTap: () => context.push('/products/${product.id}'),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(
                              child: Container(
                                width: double.infinity,
                                color: Colors.grey.shade100,
                                child: product.images.isNotEmpty
                                    ? Image.network(product.images.first, fit: BoxFit.cover)
                                    : const Icon(Icons.image, size: 40, color: Colors.grey),
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.all(8),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    product.name,
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'LAK ${product.sellingPrice.toStringAsFixed(0)}',
                                    style: TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.bold,
                                      color: Theme.of(context).colorScheme.primary,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (_, __) => const SizedBox(),
    );
  }

  Widget _featureCard(BuildContext context, IconData icon, String title, String desc) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: Theme.of(context).colorScheme.primaryContainer,
          child: Icon(icon, color: Theme.of(context).colorScheme.primary, size: 20),
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
        subtitle: Text(desc, style: const TextStyle(fontSize: 13)),
      ),
    );
  }
}
