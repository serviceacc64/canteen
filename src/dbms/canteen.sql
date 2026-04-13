CREATE DATABASE IF NOT EXISTS canteen;
USE canteen;

CREATE TABLE IF NOT EXISTS daily_entries (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    canteen_location VARCHAR(100) NOT NULL,
    entry_date DATE NOT NULL,

    cash_sales JSON NULL,
    store_purchases JSON NULL,
    store_consignment JSON NULL,
    salary_breakdown JSON NULL,

    kitchen_purchase DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    palamig_ice_purchase DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    palamig_water_purchase DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    school_supplies_purchase DECIMAL(10,2) NOT NULL DEFAULT 0.00,

    consignment_kitchen DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    consignment_palamig DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    consignment_school_supplies DECIMAL(10,2) NOT NULL DEFAULT 0.00,

    salary_of_helpers DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    utility_expenses DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    sss_of_helpers DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    lpg_expenses DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    other_operating_expenses DECIMAL(10,2) NOT NULL DEFAULT 0.00,

    total_sales DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_cash_purchases DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    payable_to_supplier DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_operating_expenses DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_expenses DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    net_profit DECIMAL(10,2) NOT NULL DEFAULT 0.00,

    remarks TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_daily_entries_canteen_date (canteen_location, entry_date)
);
