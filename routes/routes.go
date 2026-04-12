package routes

import (
	"wedding-api/handlers"
	"wedding-api/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	// Public wedding page: /w/:slug
	r.GET("/w/:slug", handlers.RenderWeddingPage)

	api := r.Group("/api")

	// ============ PUBLIC WEDDING API ============
	api.GET("/wedding/:slug", handlers.GetPublicWeddingData)
	api.POST("/wedding/:slug/rsvp", handlers.SubmitRSVP)
	api.GET("/wedding/:slug/wishes", handlers.GetWishes)
	api.POST("/wedding/:slug/wishes", handlers.SubmitWish)
	api.GET("/wedding/:slug/calendar.ics", handlers.GenerateICS)

	// ============ AUTH ============
	auth := api.Group("/auth")
	{
		auth.POST("/register", handlers.Register)
		auth.POST("/login", handlers.Login)
		auth.POST("/logout", handlers.Logout)
		auth.GET("/me", middleware.AuthMiddleware(), handlers.GetMe)
		auth.PUT("/me", middleware.AuthMiddleware(), handlers.UpdateMe)
	}

	// ============ TEMPLATES (Public) ============
	api.GET("/categories", handlers.GetCategories)
	api.GET("/templates", handlers.GetTemplates)
	api.GET("/templates/:slug", handlers.GetTemplateBySlug)

	// ============ REVIEWS (Public read + JWT create) ============
	// Tách riêng /reviews/template/:id để tránh conflict với /templates/:slug
	api.GET("/reviews/template/:id", handlers.GetTemplateReviews)

	// ============ BANNERS (Public) ============
	api.GET("/banners", handlers.GetBanners)
	api.POST("/banners/:id/click", handlers.ClickBanner)

	// ============ PROTECTED ROUTES ============
	protected := api.Group("")
	protected.Use(middleware.AuthMiddleware())
	{
		// Orders
		protected.POST("/orders", handlers.CreateOrder)
		protected.GET("/orders", handlers.GetOrders)
		protected.GET("/orders/:id", handlers.GetOrderByID)
		protected.PUT("/orders/:id/cancel", handlers.CancelOrder)

		// Wedding Info
		protected.GET("/orders/:id/wedding", handlers.GetWeddingInfo)
		protected.PUT("/orders/:id/wedding", handlers.UpdateWeddingInfo)
		protected.POST("/orders/:id/publish", handlers.PublishWedding)

		// Guests
		protected.GET("/orders/:id/guests", handlers.GetGuests)
		protected.POST("/orders/:id/guests", handlers.CreateGuest)
		protected.PUT("/orders/:id/guests/:guestId", handlers.UpdateGuest)
		protected.DELETE("/orders/:id/guests/:guestId", handlers.DeleteGuest)

		// Reviews (create - cần JWT)
		protected.POST("/reviews/template/:id", handlers.CreateReview)

		// Upload
		protected.POST("/upload/image", handlers.UploadImage)
		protected.POST("/upload/images", handlers.UploadMultipleImages)
		protected.POST("/upload/audio", handlers.UploadAudio)
	}

	// ============ ADMIN ROUTES ============
	admin := api.Group("/admin")
	admin.Use(middleware.AuthMiddleware(), middleware.AdminMiddleware())
	{
		// Dashboard
		admin.GET("/dashboard/stats", handlers.AdminDashboardStats)

		// Themes
		admin.GET("/themes", handlers.AdminListThemes)

		// Templates
		admin.POST("/templates", handlers.AdminCreateTemplate)
		admin.GET("/templates/:id", handlers.AdminGetTemplateByID)
		admin.PUT("/templates/:id", handlers.AdminUpdateTemplate)
		admin.DELETE("/templates/:id", handlers.AdminDeleteTemplate)

		// Categories
		admin.POST("/categories", handlers.AdminCreateCategory)
		admin.PUT("/categories/:id", handlers.AdminUpdateCategory)
		admin.DELETE("/categories/:id", handlers.AdminDeleteCategory)

		// Banners
		admin.GET("/banners", handlers.AdminListBanners)
		admin.POST("/banners", handlers.AdminCreateBanner)
		admin.PUT("/banners/:id", handlers.AdminUpdateBanner)
		admin.DELETE("/banners/:id", handlers.AdminDeleteBanner)

		// Orders
		admin.GET("/orders", handlers.AdminGetOrders)
		admin.GET("/orders/:id", handlers.AdminGetOrderByID)
		admin.PUT("/orders/:id/status", handlers.AdminUpdateOrderStatus)

		// Reviews
		admin.GET("/reviews", handlers.AdminGetPendingReviews)
		admin.PUT("/reviews/:id/approve", handlers.AdminApproveReview)
		admin.DELETE("/reviews/:id", handlers.AdminDeleteReview)

		// Users
		admin.GET("/users", handlers.AdminListUsers)
		admin.GET("/users/:id", handlers.AdminGetUserByID)

		// Coupons
		admin.GET("/coupons", handlers.AdminListCoupons)
		admin.GET("/coupons/:id", handlers.AdminGetCouponByID)
		admin.POST("/coupons", handlers.AdminCreateCoupon)
		admin.PUT("/coupons/:id", handlers.AdminUpdateCoupon)
		admin.DELETE("/coupons/:id", handlers.AdminDeleteCoupon)
	}
}
