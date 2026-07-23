import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/providers.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final categoriesAsync = ref.watch(categoriesProvider);
    final settingsAsync = ref.watch(settingsProvider);
    final user = authState.user;

    String storeName = 'MyStore';
    settingsAsync.whenData((settings) {
      final found = settings.where((s) => s.key == 'store_name');
      if (found.isNotEmpty) {
        storeName = found.first.value.replaceAll('"', '');
      }
    });

    return Scaffold(
      appBar: AppBar(
        title: Text(storeName),
        actions: [
          if (user != null)
            IconButton(
              icon: const Icon(Icons.person),
              onPressed: () => context.push('/profile'),
            ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(categoriesProvider);
          ref.invalidate(settingsProvider);
        },
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Hero
            const SizedBox(height: 16),
            const Icon(Icons.store, size: 80, color: Colors.blue),
            const SizedBox(height: 16),
            Text(
              'Welcome to $storeName',
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            const Text(
              'Full-stack e-commerce mobile app',
              style: TextStyle(fontSize: 16, color: Colors.grey),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            FilledButton(
              onPressed: () => context.push('/products'),
              child: const Text('Browse Products'),
            ),
            const SizedBox(height: 12),
            OutlinedButton(
              onPressed: () => context.push('/profile'),
              child: const Text('My Profile'),
            ),
            const SizedBox(height: 32),

            // Categories
            const Text('Categories',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            categoriesAsync.when(
              data: (categories) {
                if (categories.isEmpty) {
                  return const Text('No categories yet',
                      style: TextStyle(color: Colors.grey));
                }
                return Wrap(
                  spacing: 10,
                  runSpacing: 10,
                  children: categories
                      .map((cat) => GestureDetector(
                            onTap: () => context.push('/products'),
                            child: Chip(
                              label: Text(cat.name),
                              backgroundColor: Colors.blue.shade50,
                            ),
                          ))
                      .toList(),
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Text('Error: $e'),
            ),
            const SizedBox(height: 32),

            // Features
            const Text('Why Shop With Us',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            _featureCard('Wide Selection',
                'Browse through our curated collection of products.'),
            _featureCard('Easy Shopping',
                'Add items to your cart and checkout in seconds.'),
            _featureCard('Best Prices',
                'Competitive pricing with regular promotions.'),
            const SizedBox(height: 24),

            // Logout
            OutlinedButton(
              onPressed: () => ref.read(authProvider.notifier).logout(),
              style: OutlinedButton.styleFrom(
                foregroundColor: Colors.red,
                side: const BorderSide(color: Colors.red),
              ),
              child: const Text('Logout'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _featureCard(String title, String desc) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title,
                style:
                    const TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
            const SizedBox(height: 4),
            Text(desc, style: const TextStyle(color: Colors.grey, fontSize: 13)),
          ],
        ),
      ),
    );
  }
}
