import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import categoriesRoutes from "../modules/categories/categories.routes.js";
import productsRoutes from "../modules/products/products.routes.js";
import cartRoutes from '../modules/cart/cart.routes.js';
import checkoutRoutes from '../modules/checkout/checkout.routes.js';
import ordersRoutes from '../modules/orders/orders.routes.js';




const router = Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

router.use("/auth", authRoutes);
router.use("/categories", categoriesRoutes);
router.use("/products", productsRoutes);
router.use('/cart', cartRoutes);
router.use('/checkout', checkoutRoutes);
router.use('/orders', ordersRoutes);

export default router;
