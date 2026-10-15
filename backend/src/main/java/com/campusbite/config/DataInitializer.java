package com.campusbite.config;

import com.campusbite.entity.Category;
import com.campusbite.entity.FoodItem;
import com.campusbite.entity.Role;
import com.campusbite.entity.User;
import com.campusbite.repository.CategoryRepository;
import com.campusbite.repository.FoodItemRepository;
import com.campusbite.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

/**
 * DataInitializer
 * 
 * Automatically seeds the database on initial startup with:
 * 1. Default Admin Account (admin@campusbite.com / adminPassword123)
 * 2. Default Student Account (aarav.sharma@college.edu / studentSecret123)
 * 3. Five Canteen Categories (Breakfast, Meals, Snacks, Beverages, Desserts)
 * 4. Realistic college canteen food items with prices, descriptions, and prep times.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final FoodItemRepository foodItemRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, 
                           CategoryRepository categoryRepository,
                           FoodItemRepository foodItemRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.foodItemRepository = foodItemRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        seedUsers();
        Map<String, Category> categories = seedCategories();
        seedFoodItems(categories);
    }

    private void seedUsers() {
        // 1. Default Canteen Administrator
        String adminEmail = "admin@campusbite.com";
        if (!userRepository.existsByEmailIgnoreCase(adminEmail)) {
            User admin = new User();
            admin.setFullName("Canteen Administrator");
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode("adminPassword123"));
            admin.setPhone("9876543210");
            admin.setRole(Role.ROLE_ADMIN);
            userRepository.save(admin);
            System.out.println(">>> [CampusBite] Default Admin created: " + adminEmail);
        }

        // 2. Default Student
        String studentEmail = "aarav.sharma@college.edu";
        if (!userRepository.existsByEmailIgnoreCase(studentEmail)) {
            User student = new User();
            student.setFullName("Aarav Sharma");
            student.setEmail(studentEmail);
            student.setPassword(passwordEncoder.encode("studentSecret123"));
            student.setPhone("9876543211");
            student.setRole(Role.ROLE_STUDENT);
            userRepository.save(student);
            System.out.println(">>> [CampusBite] Default Student created: " + studentEmail);
        }
    }

    private Map<String, Category> seedCategories() {
        Map<String, Category> categoryMap = new HashMap<>();

        String[][] defaultCategories = {
            {"Breakfast", "Morning quick bites, sandwiches, and hot south-Indian snacks", "1"},
            {"Meals", "Hearty thalis, rice bowls, combos, and curries", "2"},
            {"Snacks", "Crispy evening snacks, samosas, rolls, and fries", "3"},
            {"Beverages", "Cold coffees, milkshakes, fresh juices, and hot teas", "4"},
            {"Desserts", "Sweet treats, ice creams, and pastries", "5"}
        };

        for (String[] catData : defaultCategories) {
            String name = catData[0];
            String desc = catData[1];
            int order = Integer.parseInt(catData[2]);

            Category category = categoryRepository.findByNameIgnoreCase(name)
                    .orElseGet(() -> categoryRepository.save(new Category(name, desc, order)));
            categoryMap.put(name, category);
        }

        return categoryMap;
    }

    private void seedFoodItems(Map<String, Category> categories) {
        if (foodItemRepository.count() > 0) {
            return; // Foods already seeded
        }

        // Category: Breakfast
        Category breakfast = categories.get("Breakfast");
        if (breakfast != null) {
            createFoodIfMissing("Masala Dosa with Chutney", "Crispy golden fermented crepe stuffed with spiced potato mash, served with coconut chutney & hot sambar", new BigDecimal("60.00"), breakfast, "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600", true, 12);
            createFoodIfMissing("Grilled Veg Cheese Sandwich", "Three-layer toasted sandwich loaded with cheddar, cucumber, tomatoes, and mint chutney", new BigDecimal("55.00"), breakfast, "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600", true, 10);
            createFoodIfMissing("Poha with Sev & Peanuts", "Light flattened rice tossed with mustard seeds, turmeric, roasted peanuts, and fresh lemon", new BigDecimal("35.00"), breakfast, "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=600", true, 8);
        }

        // Category: Meals
        Category meals = categories.get("Meals");
        if (meals != null) {
            createFoodIfMissing("Special Veg Thali", "Complete meal with 2 rotis, paneer butter masala, dal tadka, jeera rice, salad, and gulab jamun", new BigDecimal("120.00"), meals, "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600", true, 15);
            createFoodIfMissing("Chole Bhature (2 pcs)", "Fluffy deep-fried sourdough breads served with spiced chickpea curry and pickled onions", new BigDecimal("80.00"), meals, "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=600", true, 14);
            createFoodIfMissing("Paneer Fried Rice Bowl", "Wok-tossed basmati rice with golden paneer cubes, capsicum, spring onions, and garlic chili oil", new BigDecimal("95.00"), meals, "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600", true, 12);
        }

        // Category: Snacks
        Category snacks = categories.get("Snacks");
        if (snacks != null) {
            createFoodIfMissing("Crispy Potato Samosa (2 pcs)", "Flaky crust pastry filled with spiced potatoes, green peas, served with sweet tamarind chutney", new BigDecimal("30.00"), snacks, "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600", true, 6);
            createFoodIfMissing("Paneer Kathi Roll", "Smoky roasted paneer cubes, crunchy peppers, and mint mayo wrapped in a soft roti", new BigDecimal("75.00"), snacks, "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600", true, 10);
            createFoodIfMissing("Peri Peri French Fries", "Golden salted potato fries tossed in fiery African peri peri seasoning", new BigDecimal("50.00"), snacks, "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600", true, 8);
        }

        // Category: Beverages
        Category beverages = categories.get("Beverages");
        if (beverages != null) {
            createFoodIfMissing("Cold Coffee with Vanilla Ice Cream", "Creamy blended espresso coffee topped with rich vanilla ice cream scoop and cocoa powder", new BigDecimal("55.00"), beverages, "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600", true, 5);
            createFoodIfMissing("Masala Chai (Hot)", "Brewed Assam tea leaves infused with crushed ginger, cardamom, and whole milk", new BigDecimal("20.00"), beverages, "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600", true, 5);
            createFoodIfMissing("Fresh Mango Shake", "Thick seasonal mango pulp blended with chilled milk and honey", new BigDecimal("60.00"), beverages, "https://images.unsplash.com/photo-1546173159-315724a31696?w=600", false, 5); // Marked unavailable for testing!
        }

        // Category: Desserts
        Category desserts = categories.get("Desserts");
        if (desserts != null) {
            createFoodIfMissing("Hot Chocolate Brownie", "Fudgy warm walnut dark chocolate brownie drizzled with rich chocolate ganache", new BigDecimal("65.00"), desserts, "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600", true, 5);
            createFoodIfMissing("Gulab Jamun (2 pcs)", "Soft melt-in-mouth milk solids dumplings soaked in aromatic rose cardamom sugar syrup", new BigDecimal("40.00"), desserts, "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600", true, 4);
        }

        System.out.println(">>> [CampusBite] Menu foods seeded successfully across 5 categories.");
    }

    private void createFoodIfMissing(String name, String desc, BigDecimal price, Category cat, String img, boolean available, int prepTime) {
        if (!foodItemRepository.existsByNameIgnoreCaseAndCategoryId(name, cat.getId())) {
            FoodItem food = new FoodItem(name, desc, price, cat, img, available, prepTime);
            foodItemRepository.save(food);
        }
    }
}
