class User {
  final String id;
  final String email;
  final String fullName;
  final String phone;
  final String role;
  final bool isActive;
  final String createdAt;

  User({
    required this.id,
    required this.email,
    required this.fullName,
    this.phone = '',
    required this.role,
    required this.isActive,
    this.createdAt = '',
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? '',
      email: json['email'] ?? '',
      fullName: json['full_name'] ?? '',
      phone: json['phone'] ?? '',
      role: json['role'] ?? 'user',
      isActive: json['is_active'] ?? true,
      createdAt: json['created_at'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'email': email,
        'full_name': fullName,
        'phone': phone,
        'role': role,
        'is_active': isActive,
        'created_at': createdAt,
      };
}

class AuthResponse {
  final String accessToken;
  final String tokenType;
  final User user;

  AuthResponse({
    required this.accessToken,
    required this.tokenType,
    required this.user,
  });

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      accessToken: json['access_token'] ?? '',
      tokenType: json['token_type'] ?? 'bearer',
      user: User.fromJson(json['user']),
    );
  }
}

class Product {
  final String id;
  final String categoryId;
  final String name;
  final String slug;
  final String sku;
  final String barcode;
  final String description;
  final double costPrice;
  final double sellingPrice;
  final double comparePrice;
  final int stock;
  final int minStock;
  final String unit;
  final double? weight;
  final List<String> images;
  final Map<String, dynamic> features;
  final bool isFeatured;
  final bool isActive;

  Product({
    required this.id,
    this.categoryId = '',
    required this.name,
    this.slug = '',
    this.sku = '',
    this.barcode = '',
    this.description = '',
    this.costPrice = 0,
    required this.sellingPrice,
    this.comparePrice = 0,
    this.stock = 0,
    this.minStock = 0,
    this.unit = 'pcs',
    this.weight,
    this.images = const [],
    this.features = const {},
    this.isFeatured = false,
    this.isActive = true,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'] ?? '',
      categoryId: json['category_id'] ?? '',
      name: json['name'] ?? '',
      slug: json['slug'] ?? '',
      sku: json['sku'] ?? '',
      barcode: json['barcode'] ?? '',
      description: json['description'] ?? '',
      costPrice: (json['cost_price'] ?? 0).toDouble(),
      sellingPrice: (json['selling_price'] ?? 0).toDouble(),
      comparePrice: (json['compare_price'] ?? 0).toDouble(),
      stock: json['stock'] ?? 0,
      minStock: json['min_stock'] ?? 0,
      unit: json['unit'] ?? 'pcs',
      weight: json['weight']?.toDouble(),
      images: List<String>.from(json['images'] ?? []),
      features: Map<String, dynamic>.from(json['features'] ?? {}),
      isFeatured: json['is_featured'] ?? false,
      isActive: json['is_active'] ?? true,
    );
  }

  bool get inStock => stock > 0;
  bool get onSale => comparePrice > 0 && comparePrice > sellingPrice;
  double get discountPercent =>
      onSale ? ((comparePrice - sellingPrice) / comparePrice * 100) : 0;
}

class Category {
  final String id;
  final String parentId;
  final String name;
  final String slug;
  final String description;
  final String imageUrl;
  final int sortOrder;
  final bool isActive;

  Category({
    required this.id,
    this.parentId = '',
    required this.name,
    this.slug = '',
    this.description = '',
    this.imageUrl = '',
    this.sortOrder = 0,
    this.isActive = true,
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['id'] ?? '',
      parentId: json['parent_id'] ?? '',
      name: json['name'] ?? '',
      slug: json['slug'] ?? '',
      description: json['description'] ?? '',
      imageUrl: json['image_url'] ?? '',
      sortOrder: json['sort_order'] ?? 0,
      isActive: json['is_active'] ?? true,
    );
  }
}

class Order {
  final String id;
  final String orderNumber;
  final String userId;
  final String status;
  final String paymentStatus;
  final String paymentMethod;
  final double subtotal;
  final double discount;
  final double taxPercent;
  final double taxAmount;
  final double shippingFee;
  final double grandTotal;
  final String currency;
  final String notes;
  final String createdAt;
  final List<OrderItem> items;

  Order({
    required this.id,
    required this.orderNumber,
    this.userId = '',
    required this.status,
    required this.paymentStatus,
    this.paymentMethod = '',
    this.subtotal = 0,
    this.discount = 0,
    this.taxPercent = 0,
    this.taxAmount = 0,
    this.shippingFee = 0,
    required this.grandTotal,
    this.currency = 'LAK',
    this.notes = '',
    required this.createdAt,
    this.items = const [],
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['id'] ?? '',
      orderNumber: json['order_number'] ?? '',
      userId: json['user_id'] ?? '',
      status: json['status'] ?? '',
      paymentStatus: json['payment_status'] ?? '',
      paymentMethod: json['payment_method'] ?? '',
      subtotal: (json['subtotal'] ?? 0).toDouble(),
      discount: (json['discount'] ?? 0).toDouble(),
      taxPercent: (json['tax_percent'] ?? 0).toDouble(),
      taxAmount: (json['tax_amount'] ?? 0).toDouble(),
      shippingFee: (json['shipping_fee'] ?? 0).toDouble(),
      grandTotal: (json['grand_total'] ?? 0).toDouble(),
      currency: json['currency'] ?? 'LAK',
      notes: json['notes'] ?? '',
      createdAt: json['created_at'] ?? '',
      items: json['items'] != null
          ? (json['items'] as List).map((e) => OrderItem.fromJson(e)).toList()
          : [],
    );
  }
}

class OrderItem {
  final String id;
  final String productId;
  final String productName;
  final int quantity;
  final double unitPrice;
  final double subtotal;

  OrderItem({
    required this.id,
    required this.productId,
    required this.productName,
    required this.quantity,
    required this.unitPrice,
    required this.subtotal,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      id: json['id'] ?? '',
      productId: json['product_id'] ?? '',
      productName: json['product_name'] ?? '',
      quantity: json['quantity'] ?? 1,
      unitPrice: (json['unit_price'] ?? 0).toDouble(),
      subtotal: (json['subtotal'] ?? 0).toDouble(),
    );
  }
}

class Setting {
  final int id;
  final String key;
  final String value;
  final String description;

  Setting({
    required this.id,
    required this.key,
    required this.value,
    this.description = '',
  });

  factory Setting.fromJson(Map<String, dynamic> json) {
    return Setting(
      id: json['id'] ?? 0,
      key: json['setting_key'] ?? '',
      value: json['setting_value'] ?? '',
      description: json['description'] ?? '',
    );
  }
}
