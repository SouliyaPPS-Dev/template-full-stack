import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../features/cart/providers/cart_provider.dart';

class MainShell extends ConsumerStatefulWidget {
  final Widget child;
  const MainShell({super.key, required this.child});

  @override
  ConsumerState<MainShell> createState() => _MainShellState();
}

class _MainShellState extends ConsumerState<MainShell> {
  int _currentIndex = 0;

  static const _paths = ['/', '/products', '/cart', '/orders', '/profile'];
  static const _icons = [
    Icons.home_outlined,
    Icons.store_outlined,
    Icons.shopping_cart_outlined,
    Icons.receipt_long_outlined,
    Icons.person_outline,
  ];
  static const _activeIcons = [
    Icons.home,
    Icons.store,
    Icons.shopping_cart,
    Icons.receipt_long,
    Icons.person,
  ];
  static const _labels = ['Home', 'Products', 'Cart', 'Orders', 'Profile'];

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final location = GoRouterState.of(context).matchedLocation;
    for (var i = 0; i < _paths.length; i++) {
      if (location == _paths[i] || location.startsWith('${_paths[i]}/')) {
        if (_currentIndex != i) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            if (mounted) setState(() => _currentIndex = i);
          });
        }
        break;
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final cartCount = ref.watch(cartProvider).itemCount;
    final width = MediaQuery.sizeOf(context).width;
    final showRail = width >= 600;
    final showWideRail = width >= 1024;

    if (showRail) {
      return Scaffold(
        body: Row(
          children: [
            if (showWideRail)
              _buildNavigationRail(context, cartCount, extended: true)
            else
              _buildNavigationRail(context, cartCount),
            const VerticalDivider(width: 1),
            Expanded(child: widget.child),
          ],
        ),
      );
    }

    return Scaffold(
      body: widget.child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        height: 64,
        destinations: List.generate(_paths.length, (i) {
          final count = i == 2 ? cartCount : 0;
          return NavigationDestination(
            icon: Badge(
              isLabelVisible: count > 0,
              label: Text('$count'),
              child: Icon(i == _currentIndex ? _activeIcons[i] : _icons[i]),
            ),
            label: _labels[i],
          );
        }),
        onDestinationSelected: (i) {
          setState(() => _currentIndex = i);
          context.go(_paths[i]);
        },
      ),
    );
  }

  Widget _buildNavigationRail(BuildContext context, int cartCount, {bool extended = false}) {
    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        border: Border(
          right: BorderSide(color: Theme.of(context).dividerColor.withAlpha(50)),
        ),
      ),
      child: NavigationRail(
        selectedIndex: _currentIndex,
        extended: extended,
        labelType: extended ? NavigationRailLabelType.none : NavigationRailLabelType.all,
        leading: Padding(
          padding: const EdgeInsets.symmetric(vertical: 12),
          child: Row(
            mainAxisAlignment: extended ? MainAxisAlignment.start : MainAxisAlignment.center,
            children: [
              Icon(Icons.store, size: 28, color: Theme.of(context).colorScheme.primary),
              if (extended) ...[
                const SizedBox(width: 12),
                Text(
                  'Template',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Theme.of(context).colorScheme.primary,
                  ),
                ),
              ],
            ],
          ),
        ),
        trailing: const Expanded(
          child: Align(
            alignment: Alignment.bottomCenter,
            child: Padding(
              padding: EdgeInsets.only(bottom: 16),
              child: Icon(Icons.dark_mode_outlined, size: 20),
            ),
          ),
        ),
        destinations: List.generate(_paths.length, (i) {
          final count = i == 2 ? cartCount : 0;
          return NavigationRailDestination(
            icon: Badge(
              isLabelVisible: count > 0,
              label: Text('$count'),
              child: Icon(i == _currentIndex ? _activeIcons[i] : _icons[i]),
            ),
            selectedIcon: Icon(_activeIcons[i]),
            label: extended
                ? Align(
                    alignment: Alignment.centerLeft,
                    child: Text(_labels[i]),
                  )
                : Text(_labels[i]),
          );
        }),
        onDestinationSelected: (i) {
          setState(() => _currentIndex = i);
          context.go(_paths[i]);
        },
      ),
    );
  }
}
