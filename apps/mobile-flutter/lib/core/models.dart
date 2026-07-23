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
  final String description;
  final double costPrice;
  final double sellingPrice;
  final double comparePrice;
  final int stock;
  final String unit;
  final List<String> images;
  final bool isFeatured;
  final bool isActive;

  Product({
    required this.id,
    this.categoryId = '',
    required this.name,
    this.slug = '',
    this.sku = '',
    this.description = '',
    this.costPrice = 0,
    required this.sellingPrice,
    this.comparePrice = 0,
    this.stock = 0,
    this.unit = 'pcs',
    this.images = const [],
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
      description: json['description'] ?? '',
      costPrice: (json['cost_price'] ?? 0).toDouble(),
      sellingPrice: (json['selling_price'] ?? 0).toDouble(),
      comparePrice: (json['compare_price'] ?? 0).toDouble(),
      stock: json['stock'] ?? 0,
      unit: json['unit'] ?? 'pcs',
      images: List<String>.from(json['images'] ?? []),
      isFeatured: json['is_featured'] ?? false,
      isActive: json['is_active'] ?? true,
    );
  }
}

class Category {
  final String id;
  final String name;
  final String slug;
  final String description;
  final String imageUrl;
  final bool isActive;

  Category({
    required this.id,
    required this.name,
    this.slug = '',
    this.description = '',
    this.imageUrl = '',
    this.isActive = true,
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      slug: json['slug'] ?? '',
      description: json['description'] ?? '',
      imageUrl: json['image_url'] ?? '',
      isActive: json['is_active'] ?? true,
    );
  }
}

class Order {
  final String id;
  final String orderNumber;
  final String status;
  final String paymentStatus;
  final double grandTotal;
  final String createdAt;

  Order({
    required this.id,
    required this.orderNumber,
    required this.status,
    required this.paymentStatus,
    required this.grandTotal,
    required this.createdAt,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['id'] ?? '',
      orderNumber: json['order_number'] ?? '',
      status: json['status'] ?? '',
      paymentStatus: json['payment_status'] ?? '',
      grandTotal: (json['grand_total'] ?? 0).toDouble(),
      createdAt: json['created_at'] ?? '',
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
