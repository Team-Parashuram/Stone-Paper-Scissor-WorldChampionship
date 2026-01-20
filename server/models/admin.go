package models

import (
	"time"

	"gorm.io/gorm"
)

// AdminRole defines the role of an admin
type AdminRole string

const (
	RoleSuperAdmin AdminRole = "super_admin"
	RoleAdmin      AdminRole = "admin"
)

// Admin represents an admin user in the system
type Admin struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	Username     string         `gorm:"uniqueIndex;not null" json:"username"`
	Email        string         `gorm:"uniqueIndex;not null" json:"email"`
	PasswordHash string         `gorm:"not null" json:"-"`
	Role         AdminRole      `gorm:"not null;default:'admin'" json:"role"`
	CreatedByID  *uint          `json:"created_by_id,omitempty"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationship - Admin who created this admin
	CreatedBy *Admin `gorm:"foreignKey:CreatedByID" json:"created_by,omitempty"`
}

// AdminLoginRequest for admin login
type AdminLoginRequest struct {
	Username string `json:"username" validate:"required"`
	Password string `json:"password" validate:"required"`
}

// AdminRegisterRequest for super admin registration
type AdminRegisterRequest struct {
	Username string `json:"username" validate:"required"`
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6"`
}

// CreateAdminRequest for creating admin by super admin
type CreateAdminRequest struct {
	Username string `json:"username" validate:"required"`
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6"`
}

// AdminResponse for API responses
type AdminResponse struct {
	ID        uint      `json:"id"`
	Username  string    `json:"username"`
	Email     string    `json:"email"`
	Role      AdminRole `json:"role"`
	CreatedAt time.Time `json:"created_at"`
}

// AuthResponse for login/register responses
type AuthResponse struct {
	Token string        `json:"token"`
	Admin AdminResponse `json:"admin"`
}
