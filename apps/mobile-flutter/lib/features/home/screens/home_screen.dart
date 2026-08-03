import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/api_service.dart';
import '../../../core/config.dart';
import '../../../core/format.dart';
import '../../../core/models.dart';
import '../../../core/providers.dart';

const _categoryEmoji = [
  '🏠',
  '🍽️',
  '👗',
  '📱',
  '🧸',
  '📚',
  '⚡',
  '🛠️',
  '🧴',
  '🚗'
];

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  bool _showTests = false;

  @override
  Widget build(BuildContext context) {
    final settingsAsync = ref.watch(settingsProvider);
    String storeName = appName;
    final settings = settingsAsync.asData?.value;
    if (settings != null) {
      for (final s in settings) {
        if (s.key == 'store_name') {
          storeName = s.value.replaceAll('"', '');
          break;
        }
      }
    }
    final loadingSettings = settingsAsync.isLoading;

    return Scaffold(
      appBar: AppBar(
        title: Text(loadingSettings ? appName : storeName),
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(categoriesProvider);
          ref.invalidate(settingsProvider);
          ref.invalidate(productsProvider);
          ref.invalidate(healthCheckProvider);
        },
        child: _buildContent(context, storeName, loadingSettings),
      ),
    );
  }

  Widget _buildContent(
      BuildContext context, String storeName, bool loadingSettings) {
    final width = MediaQuery.sizeOf(context).width;
    final isDesktop = width >= 1024;
    final isTablet = width >= 600;
    final maxWidth = isDesktop
        ? 1200.0
        : isTablet
            ? 960.0
            : width.toDouble();
    final horizontalPadding = isDesktop
        ? 40.0
        : isTablet
            ? 24.0
            : 20.0;

    return ListView(
      padding: EdgeInsets.fromLTRB(horizontalPadding, 0, horizontalPadding, 48),
      children: [
        Center(
          child: ConstrainedBox(
            constraints: BoxConstraints(maxWidth: maxWidth),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                _buildHero(context, storeName, loadingSettings, isDesktop),
                _buildCategoriesSection(context, ref),
                _buildFeaturedSection(context, ref),
                _buildFeaturesSection(context, isDesktop),
                _buildDevTools(context, ref),
                _buildLogout(context, ref),
              ],
            ),
          ),
        ),
      ],
    );
  }

  // ── Hero ────────────────────────────────────────────────────

  Widget _buildHero(BuildContext context, String storeName,
      bool loadingSettings, bool isDesktop) {
    final primary = Theme.of(context).colorScheme.primary;
    return Container(
      margin: const EdgeInsets.only(top: 16),
      padding: EdgeInsets.symmetric(
        vertical: isDesktop ? 48 : 32,
        horizontal: isDesktop ? 48 : 24,
      ),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [primary, primary.withValues(alpha: 0.75)],
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: primary.withValues(alpha: 0.25),
            blurRadius: 16,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(999),
            ),
            child: const Text(
              '🛒 Shop online',
              style:
                  TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
            ),
          ),
          const SizedBox(height: 12),
          Text(
            loadingSettings ? 'Welcome!' : 'Welcome to $storeName',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: isDesktop ? 36 : 28,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Your one-stop shop for quality products at the best prices.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: isDesktop ? 18 : 16,
              color: Colors.white.withValues(alpha: 0.85),
            ),
          ),
          const SizedBox(height: 20),
          if (isDesktop)
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _heroPrimaryButton(context),
                const SizedBox(width: 16),
                _heroSecondaryButton(context),
              ],
            )
          else
            Column(
              children: [
                _heroPrimaryButton(context),
                const SizedBox(height: 12),
                _heroSecondaryButton(context),
              ],
            ),
        ],
      ),
    );
  }

  Widget _heroPrimaryButton(BuildContext context) {
    return SizedBox(
      width: 180,
      child: FilledButton(
        style: FilledButton.styleFrom(
          backgroundColor: Colors.white,
          foregroundColor: Theme.of(context).colorScheme.primary,
        ),
        onPressed: () => context.go('/products'),
        child: const Text('Browse Products'),
      ),
    );
  }

  Widget _heroSecondaryButton(BuildContext context) {
    return SizedBox(
      width: 180,
      child: OutlinedButton(
        style: OutlinedButton.styleFrom(
          foregroundColor: Colors.white,
          side: BorderSide(color: Colors.white.withValues(alpha: 0.6)),
        ),
        onPressed: () => context.go('/orders'),
        child: const Text('My Orders'),
      ),
    );
  }

  // ── Section header helpers ──────────────────────────────────

  Widget _sectionHeader(
      BuildContext context, String title, VoidCallback onSeeAll) {
    return Row(
      children: [
        Expanded(
          child: Text(
            title,
            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
        ),
        TextButton(onPressed: onSeeAll, child: const Text('See all')),
      ],
    );
  }

  // ── Categories ──────────────────────────────────────────────

  Widget _buildCategoriesSection(BuildContext context, WidgetRef ref) {
    final categoriesAsync = ref.watch(categoriesProvider);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 24),
        _sectionHeader(
            context, 'Shop by Category', () => context.go('/products')),
        const SizedBox(height: 8),
        categoriesAsync.when(
          data: (categories) {
            if (categories.isEmpty) {
              return const Padding(
                padding: EdgeInsets.symmetric(vertical: 16),
                child: Text('No categories yet',
                    style: TextStyle(color: Colors.grey)),
              );
            }
            final width = MediaQuery.sizeOf(context).width;
            final cols = width >= 1440
                ? 5
                : width >= 1024
                    ? 3
                    : width >= 600
                        ? 3
                        : 2;
            return LayoutBuilder(
              builder: (context, constraints) {
                const gap = 8.0;
                final itemWidth =
                    (constraints.maxWidth - gap * (cols - 1)) / cols;
                return Wrap(
                  spacing: gap,
                  runSpacing: gap,
                  children: [
                    for (var i = 0; i < categories.length; i++)
                      SizedBox(
                        width: itemWidth,
                        child: _categoryCard(context, categories[i], i),
                      ),
                  ],
                );
              },
            );
          },
          loading: () => const Padding(
            padding: EdgeInsets.symmetric(vertical: 24),
            child: Center(child: CircularProgressIndicator()),
          ),
          error: (e, _) => Padding(
            padding: const EdgeInsets.symmetric(vertical: 16),
            child: Text('Failed to load categories: $e',
                style: const TextStyle(color: Colors.red)),
          ),
        ),
      ],
    );
  }

  Widget _categoryCard(BuildContext context, Category cat, int index) {
    return InkWell(
      onTap: () {
        ref.read(selectedCategoryProvider.notifier).set(cat.id);
        context.go('/products');
      },
      borderRadius: BorderRadius.circular(12),
      child: Ink(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        decoration: BoxDecoration(
          color: Theme.of(context)
              .colorScheme
              .primaryContainer
              .withValues(alpha: 0.5),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          children: [
            Text(
              _categoryEmoji[index % _categoryEmoji.length],
              style: const TextStyle(fontSize: 24),
            ),
            const SizedBox(height: 4),
            Text(
              cat.name,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: Theme.of(context).colorScheme.primary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── Featured Products ───────────────────────────────────────

  Widget _buildFeaturedSection(BuildContext context, WidgetRef ref) {
    final productsAsync = ref.watch(productsProvider);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 24),
        _sectionHeader(
            context, 'Featured Products', () => context.go('/products')),
        const SizedBox(height: 8),
        productsAsync.when(
          data: (products) {
            final featured = products
                .where((p) => p.isFeatured && p.isActive)
                .take(8)
                .toList();
            if (featured.isEmpty) {
              return const Padding(
                padding: EdgeInsets.symmetric(vertical: 16),
                child: Text('No featured products yet',
                    style: TextStyle(color: Colors.grey)),
              );
            }
            return SizedBox(
              height: 220,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: featured.length,
                separatorBuilder: (_, __) => const SizedBox(width: 12),
                itemBuilder: (context, index) =>
                    _featuredCard(context, featured[index]),
              ),
            );
          },
          loading: () => const Padding(
            padding: EdgeInsets.symmetric(vertical: 24),
            child: Center(child: CircularProgressIndicator()),
          ),
          error: (_, __) => const SizedBox.shrink(),
        ),
      ],
    );
  }

  Widget _featuredCard(BuildContext context, Product product) {
    final primary = Theme.of(context).colorScheme.primary;
    return SizedBox(
      width: 180,
      child: Card(
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: () => context.push('/products/${product.id}'),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(
                height: 110,
                width: double.infinity,
                child: product.images.isNotEmpty
                    ? Image.network(
                        product.images.first,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => const Center(
                          child: Text('📦', style: TextStyle(fontSize: 32)),
                        ),
                      )
                    : const Center(
                        child: Text('📦', style: TextStyle(fontSize: 32))),
              ),
              Padding(
                padding: const EdgeInsets.all(10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      product.name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                          fontSize: 14, fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      formatMoney(product.sellingPrice),
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: primary,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ── Why Shop With Us ────────────────────────────────────────

  Widget _buildFeaturesSection(BuildContext context, bool isDesktop) {
    final features = <(IconData, String, String)>[
      (
        Icons.shopping_bag,
        'Wide Selection',
        'Browse through our curated collection of products.'
      ),
      (
        Icons.bolt,
        'Easy Shopping',
        'Add items to your cart and checkout in seconds.'
      ),
      (
        Icons.sell,
        'Best Prices',
        'Competitive pricing with regular promotions.'
      ),
    ];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 24),
        const Text('Why Shop With Us',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        if (isDesktop)
          Row(
            children: [
              for (final (icon, title, desc) in features)
                Expanded(
                  child: _featureCard(context, icon, title, desc,
                      margin: const EdgeInsets.only(right: 12)),
                ),
            ],
          )
        else
          Column(
            children: [
              for (final (icon, title, desc) in features)
                _featureCard(context, icon, title, desc),
            ],
          ),
      ],
    );
  }

  Widget _featureCard(
    BuildContext context,
    IconData icon,
    String title,
    String desc, {
    EdgeInsetsGeometry? margin,
  }) {
    return Card(
      margin: margin ?? const EdgeInsets.only(bottom: 10),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: Theme.of(context).colorScheme.primaryContainer,
          child: Icon(icon,
              color: Theme.of(context).colorScheme.primary, size: 20),
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
        subtitle: Text(desc, style: const TextStyle(fontSize: 13)),
      ),
    );
  }

  // ── Developer Tools ─────────────────────────────────────────

  Widget _buildDevTools(BuildContext context, WidgetRef ref) {
    final healthAsync = ref.watch(healthCheckProvider);
    final testAsync = ref.watch(testEndpointsProvider);
    final apiOk = healthAsync.hasValue;
    final statusColor = apiOk ? Colors.green : Colors.red;

    return Card(
      margin: const EdgeInsets.only(top: 24),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Developer Tools',
                          style: TextStyle(
                              fontSize: 16, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 2),
                      Text(
                        '${isProd ? 'PRODUCTION' : 'DEVELOPMENT'} · $apiBaseUrl',
                        style: TextStyle(
                            fontSize: 11, color: Colors.grey.shade500),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: (apiOk ? Colors.green : Colors.red).shade50,
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 6,
                        height: 6,
                        decoration: BoxDecoration(
                          color: statusColor,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        apiOk ? 'API OK' : 'checking...',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: statusColor,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: () {
                  setState(() => _showTests = !_showTests);
                  if (!_showTests && !testAsync.hasValue) {
                    ref.invalidate(testEndpointsProvider);
                  }
                },
                child: Text(
                    _showTests ? 'Hide Endpoint Tests' : 'Test All Endpoints'),
              ),
            ),
            if (_showTests) ...[
              const SizedBox(height: 8),
              testAsync.when(
                data: (results) => Column(
                  children: [
                    for (final entry in results.entries)
                      _endpointRow(entry.key, entry.value),
                  ],
                ),
                loading: () => const Padding(
                  padding: EdgeInsets.all(12),
                  child: Center(child: CircularProgressIndicator()),
                ),
                error: (e, _) => _endpointRow(
                  'Test run failed',
                  EndpointTestResult(ok: false, error: '$e'),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _endpointRow(String name, EndpointTestResult result) {
    final color = result.ok ? Colors.green : Colors.red;
    return Container(
      margin: const EdgeInsets.only(bottom: 4),
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
      decoration: BoxDecoration(
        color: color.shade50,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        children: [
          Expanded(
            child: Text(
              name,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontSize: 13),
            ),
          ),
          Text(
            result.ok ? 'PASS' : 'FAIL',
            style: TextStyle(
              color: color,
              fontSize: 13,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  // ── Logout ──────────────────────────────────────────────────

  Widget _buildLogout(BuildContext context, WidgetRef ref) {
    return Padding(
      padding: const EdgeInsets.only(top: 24),
      child: OutlinedButton.icon(
        onPressed: () {
          ref.read(authProvider.notifier).logout();
          context.go('/login');
        },
        icon: const Icon(Icons.logout),
        label: const Text('Logout'),
        style: OutlinedButton.styleFrom(
          foregroundColor: Colors.red,
          side: const BorderSide(color: Colors.red),
        ),
      ),
    );
  }
}
