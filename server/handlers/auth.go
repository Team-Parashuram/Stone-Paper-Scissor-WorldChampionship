package handlers

import (
	"os"
	"strings"
	"time"

	"stone-paper-scissors/config"
	"stone-paper-scissors/models"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

var jwtSecret = []byte(getJWTSecret())

func getJWTSecret() string {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return "stone-paper-scissors-secret-key-2024"
	}
	return secret
}

// HashPassword hashes a password using bcrypt
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

// CheckPasswordHash compares a password with a hash
func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// GenerateToken generates a JWT token for an admin
func GenerateToken(admin *models.Admin) (string, error) {
	claims := jwt.MapClaims{
		"id":       admin.ID,
		"username": admin.Username,
		"email":    admin.Email,
		"role":     admin.Role,
		"exp":      time.Now().Add(time.Hour * 24).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

// ParseToken parses and validates a JWT token
func ParseToken(tokenString string) (*jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		return &claims, nil
	}

	return nil, fiber.ErrUnauthorized
}

// CheckSuperAdminExists checks if any super admin exists in the system
func CheckSuperAdminExists(c *fiber.Ctx) error {
	var count int64
	config.DB.Model(&models.Admin{}).Where("role = ?", models.RoleSuperAdmin).Count(&count)
	return c.JSON(fiber.Map{
		"exists": count > 0,
	})
}

// RegisterSuperAdmin registers a new super admin (only if no super admin exists)
func RegisterSuperAdmin(c *fiber.Ctx) error {
	var req models.AdminRegisterRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if req.Username == "" || req.Email == "" || req.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Username, email, and password are required",
		})
	}

	if len(req.Password) < 6 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Password must be at least 6 characters",
		})
	}

	// Check if any super admin already exists
	var existingSuper models.Admin
	if result := config.DB.Where("role = ?", models.RoleSuperAdmin).First(&existingSuper); result.Error == nil {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Super admin already exists. Please login instead.",
		})
	}

	// Check if username or email already exists
	var existing models.Admin
	if result := config.DB.Where("username = ? OR email = ?", req.Username, req.Email).First(&existing); result.Error == nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"error": "Username or email already exists",
		})
	}

	// Hash password
	hashedPassword, err := HashPassword(req.Password)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to hash password",
		})
	}

	// Create super admin
	admin := models.Admin{
		Username:     req.Username,
		Email:        req.Email,
		PasswordHash: hashedPassword,
		Role:         models.RoleSuperAdmin,
	}

	if result := config.DB.Create(&admin); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create super admin",
		})
	}

	// Generate token
	token, err := GenerateToken(&admin)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to generate token",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Super admin registered successfully",
		"token":   token,
		"admin": models.AdminResponse{
			ID:        admin.ID,
			Username:  admin.Username,
			Email:     admin.Email,
			Role:      admin.Role,
			CreatedAt: admin.CreatedAt,
		},
	})
}

// Login handles admin login
func Login(c *fiber.Ctx) error {
	var req models.AdminLoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if req.Username == "" || req.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Username and password are required",
		})
	}

	// Find admin by username
	var admin models.Admin
	if result := config.DB.Where("username = ?", req.Username).First(&admin); result.Error != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid credentials",
		})
	}

	// Check password
	if !CheckPasswordHash(req.Password, admin.PasswordHash) {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid credentials",
		})
	}

	// Generate token
	token, err := GenerateToken(&admin)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to generate token",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Login successful",
		"token":   token,
		"admin": models.AdminResponse{
			ID:        admin.ID,
			Username:  admin.Username,
			Email:     admin.Email,
			Role:      admin.Role,
			CreatedAt: admin.CreatedAt,
		},
	})
}

// GetMe returns the current authenticated admin
func GetMe(c *fiber.Ctx) error {
	admin := c.Locals("admin").(*models.Admin)

	return c.JSON(fiber.Map{
		"admin": models.AdminResponse{
			ID:        admin.ID,
			Username:  admin.Username,
			Email:     admin.Email,
			Role:      admin.Role,
			CreatedAt: admin.CreatedAt,
		},
	})
}

// // CheckSuperAdminExists checks if a super admin exists
// func CheckSuperAdminExists(c *fiber.Ctx) error {
// 	var count int64
// 	config.DB.Model(&models.Admin{}).Where("role = ?", models.RoleSuperAdmin).Count(&count)

// 	return c.JSON(fiber.Map{
// 		"exists": count > 0,
// 	})
// }

// CreateAdmin creates a new admin (only super admin can do this)
func CreateAdmin(c *fiber.Ctx) error {
	currentAdmin := c.Locals("admin").(*models.Admin)

	if currentAdmin.Role != models.RoleSuperAdmin {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Only super admin can create admins",
		})
	}

	var req models.CreateAdminRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if req.Username == "" || req.Email == "" || req.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Username, email, and password are required",
		})
	}

	if len(req.Password) < 6 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Password must be at least 6 characters",
		})
	}

	// Check if username or email already exists
	var existing models.Admin
	if result := config.DB.Where("username = ? OR email = ?", req.Username, req.Email).First(&existing); result.Error == nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"error": "Username or email already exists",
		})
	}

	// Hash password
	hashedPassword, err := HashPassword(req.Password)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to hash password",
		})
	}

	// Create admin
	admin := models.Admin{
		Username:     req.Username,
		Email:        req.Email,
		PasswordHash: hashedPassword,
		Role:         models.RoleAdmin,
		CreatedByID:  &currentAdmin.ID,
	}

	if result := config.DB.Create(&admin); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create admin",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Admin created successfully",
		"admin": models.AdminResponse{
			ID:        admin.ID,
			Username:  admin.Username,
			Email:     admin.Email,
			Role:      admin.Role,
			CreatedAt: admin.CreatedAt,
		},
	})
}

// GetAllAdmins returns all admins (only super admin can see this)
func GetAllAdmins(c *fiber.Ctx) error {
	currentAdmin := c.Locals("admin").(*models.Admin)

	if currentAdmin.Role != models.RoleSuperAdmin {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Only super admin can view all admins",
		})
	}

	var admins []models.Admin
	if result := config.DB.Where("role = ?", models.RoleAdmin).Find(&admins); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch admins",
		})
	}

	var response []models.AdminResponse
	for _, admin := range admins {
		response = append(response, models.AdminResponse{
			ID:        admin.ID,
			Username:  admin.Username,
			Email:     admin.Email,
			Role:      admin.Role,
			CreatedAt: admin.CreatedAt,
		})
	}

	return c.JSON(fiber.Map{
		"admins": response,
		"total":  len(response),
	})
}

// DeleteAdmin deletes an admin and all their matches (only super admin)
func DeleteAdmin(c *fiber.Ctx) error {
	currentAdmin := c.Locals("admin").(*models.Admin)

	if currentAdmin.Role != models.RoleSuperAdmin {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Only super admin can delete admins",
		})
	}

	id := c.Params("id")

	var admin models.Admin
	if result := config.DB.First(&admin, id); result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Admin not found",
		})
	}

	if admin.Role == models.RoleSuperAdmin {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Cannot delete super admin",
		})
	}

	// Start transaction
	tx := config.DB.Begin()

	// Delete all matches created by this admin
	if err := tx.Where("created_by_admin_id = ?", admin.ID).Delete(&models.Match{}).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete admin's matches",
		})
	}

	// Delete the admin
	if err := tx.Delete(&admin).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete admin",
		})
	}

	tx.Commit()

	return c.JSON(fiber.Map{
		"message": "Admin and all their matches deleted successfully",
	})
}

// AuthMiddleware validates JWT token and sets admin in context
func AuthMiddleware(c *fiber.Ctx) error {
	authHeader := c.Get("Authorization")
	if authHeader == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Authorization header required",
		})
	}

	// Extract token from "Bearer <token>"
	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid authorization header format",
		})
	}

	tokenString := parts[1]
	claims, err := ParseToken(tokenString)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid or expired token",
		})
	}

	// Get admin from database
	adminID := uint((*claims)["id"].(float64))
	var admin models.Admin
	if result := config.DB.First(&admin, adminID); result.Error != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Admin not found",
		})
	}

	// Set admin in context
	c.Locals("admin", &admin)

	return c.Next()
}

// SuperAdminOnly middleware - only allows super admins
func SuperAdminOnly(c *fiber.Ctx) error {
	admin := c.Locals("admin").(*models.Admin)

	if admin.Role != models.RoleSuperAdmin {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Super admin access required",
		})
	}

	return c.Next()
}

// AdminOnly middleware - allows both admin and super admin
func AdminOnly(c *fiber.Ctx) error {
	admin := c.Locals("admin").(*models.Admin)

	if admin.Role != models.RoleAdmin && admin.Role != models.RoleSuperAdmin {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Admin access required",
		})
	}

	return c.Next()
}
