package config

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/mysql"
	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func ConnectDatabase() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	driver := getEnv("DB_DRIVER", "sqlite")
	var database *gorm.DB
	var err error

	switch driver {
	case "postgres":
		dsn := fmt.Sprintf(
			"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
			getEnv("DB_HOST", "localhost"),
			getEnv("DB_PORT", "5432"),
			getEnv("DB_USER", "postgres"),
			getEnv("DB_PASSWORD", ""),
			getEnv("DB_NAME", "sps_championship"),
			getEnv("DB_SSLMODE", "disable"),
		)
		database, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})

	case "mysql":
		dsn := fmt.Sprintf(
			"%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
			getEnv("DB_USER", "root"),
			getEnv("DB_PASSWORD", ""),
			getEnv("DB_HOST", "localhost"),
			getEnv("DB_PORT", "3306"),
			getEnv("DB_NAME", "sps_championship"),
		)
		database, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})

	default: // sqlite
		dbName := getEnv("DB_NAME", "sps_championship")
		if driver == "sqlite" && !contains(dbName, ".db") {
			dbName = dbName + ".db"
		}
		database, err = gorm.Open(sqlite.Open(dbName), &gorm.Config{})
	}

	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	DB = database
	log.Printf("Database connected successfully! (driver: %s)", driver)
}

func contains(s, substr string) bool {
	return len(s) >= len(substr) && (s[len(s)-len(substr):] == substr)
}
