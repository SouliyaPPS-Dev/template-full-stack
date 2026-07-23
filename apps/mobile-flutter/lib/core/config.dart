const String apiBaseUrl = String.fromEnvironment(
  "API_BASE_URL",
  defaultValue: "http://localhost:8080",
);

class ApiEndpoints {
  static const products = "/api/v1/products";
  static const orders = "/api/v1/orders";
  static const users = "/api/v1/users";
  static const auth = "/api/v1/auth";
  static const categories = "/api/v1/categories";
}
