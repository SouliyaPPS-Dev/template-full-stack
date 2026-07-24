import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/providers.dart';
import '../../../shared/breakpoints.dart';
import '../../../shared/widgets/product_card.dart';
import '../../cart/providers/cart_provider.dart';

class ProductsScreen extends ConsumerStatefulWidget {
  const ProductsScreen({super.key});

  @override
  ConsumerState<ProductsScreen> createState() => _ProductsScreenState();
}

class _ProductsScreenState extends ConsumerState<ProductsScreen> {
  final _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final selectedCategory = ref.watch(selectedCategoryProvider);
    final productsAsync = ref.watch(filteredProductsProvider);
    final categoriesAsync = ref.watch(categoriesProvider);
    final width = MediaQuery.sizeOf(context).width;
    final isWide = width >= 1024;
    final isMedium = width >= 600;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Products'),
        actions: [
          if (selectedCategory != null)
            IconButton(
              icon: const Icon(Icons.clear_all),
              tooltip: 'Clear filter',
              onPressed: () {
                ref.read(selectedCategoryProvider.notifier).state = null;
                ref.invalidate(productsProvider);
              },
            ),
        ],
      ),
      body: Column(
        children: [
          // Search bar
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 600),
              child: TextField(
                controller: _searchController,
                decoration: InputDecoration(
                  hintText: 'Search products...',
                  prefixIcon: const Icon(Icons.search),
                  suffixIcon: _searchController.text.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.clear),
                          onPressed: () {
                            _searchController.clear();
                            ref.read(searchQueryProvider.notifier).state = '';
                          },
                        )
                      : null,
                  border: const OutlineInputBorder(),
                ),
                onChanged: (value) {
                  ref.read(searchQueryProvider.notifier).state = value;
                  setState(() {});
                },
              ),
            ),
          ),

          // Category filter chips
          categoriesAsync.when(
            data: (categories) {
              if (categories.isEmpty) return const SizedBox();
              return SizedBox(
                height: 44,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: categories.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 8),
                  itemBuilder: (context, index) {
                    final cat = categories[index];
                    final isSelected = selectedCategory == cat.id;
                    return FilterChip(
                      label: Text(cat.name),
                      selected: isSelected,
                      onSelected: (selected) {
                        ref.read(selectedCategoryProvider.notifier).state =
                            selected ? cat.id : null;
                        if (selected) {
                          ref.read(searchQueryProvider.notifier).state = '';
                          _searchController.clear();
                        }
                        ref.invalidate(productsProvider);
                      },
                    );
                  },
                ),
              );
            },
            loading: () => const SizedBox(),
            error: (_, __) => const SizedBox(),
          ),
          const SizedBox(height: 8),

          // Products grid/list
          Expanded(
            child: RefreshIndicator(
              onRefresh: () async {
                ref.invalidate(productsProvider);
                ref.invalidate(filteredProductsProvider);
              },
              child: productsAsync.when(
                data: (products) {
                  if (products.isEmpty) {
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.inventory_2_outlined, size: 64, color: Colors.grey.shade300),
                          const SizedBox(height: 16),
                          const Text('No products found', style: TextStyle(fontSize: 18, color: Colors.grey)),
                        ],
                      ),
                    );
                  }

                  return Center(
                    child: ConstrainedBox(
                      constraints: BoxConstraints(
                        maxWidth: isWide ? 1200 : isMedium ? 800 : double.infinity,
                      ),
                      child: GridView.builder(
                        padding: const EdgeInsets.all(16),
                        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: AppBreakpoints.gridColumns(context),
                          childAspectRatio: 0.72,
                          crossAxisSpacing: 12,
                          mainAxisSpacing: 12,
                        ),
                        itemCount: products.length,
                        itemBuilder: (context, index) {
                          final product = products[index];
                          return ProductCard(
                            product: product,
                            onTap: () => context.push('/products/${product.id}'),
                            onAddToCart: (p) {
                              ref.read(cartProvider.notifier).addItem(p);
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text('${p.name} added to cart'),
                                  action: SnackBarAction(
                                    label: 'View Cart',
                                    onPressed: () => context.push('/cart'),
                                  ),
                                ),
                              );
                            },
                          );
                        },
                      ),
                    ),
                  );
                },
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (e, _) => Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.error_outline, size: 48, color: Colors.red),
                      const SizedBox(height: 16),
                      const Text('Failed to load products'),
                      const SizedBox(height: 16),
                      FilledButton(
                        onPressed: () => ref.invalidate(productsProvider),
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
