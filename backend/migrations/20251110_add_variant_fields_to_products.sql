-- 产品变体功能数据库迁移
-- 添加变体相关字段到products表
-- Migration: Add variant fields to products table
-- Date: 2025-11-10
-- Version: v1.0.0

BEGIN;

-- 检查字段是否已存在，避免重复添加
DO $$
BEGIN
    -- 添加 is_template 字段
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'products'
        AND column_name = 'is_template'
    ) THEN
        ALTER TABLE products ADD COLUMN is_template BOOLEAN DEFAULT false NOT NULL;
        COMMENT ON COLUMN products.is_template IS '是否为产品模板';
    END IF;

    -- 添加 parent_id 字段
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'products'
        AND column_name = 'parent_id'
    ) THEN
        ALTER TABLE products ADD COLUMN parent_id UUID REFERENCES products(id);
        COMMENT ON COLUMN products.parent_id IS '父产品ID（模板或变体关系）';
    END IF;

    -- 添加 variant_attributes 字段
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'products'
        AND column_name = 'variant_attributes'
    ) THEN
        ALTER TABLE products ADD COLUMN variant_attributes JSONB DEFAULT '[]'::jsonb;
        COMMENT ON COLUMN products.variant_attributes IS '变体属性数组';
    END IF;
END $$;

-- 创建索引以优化查询性能
-- Index on parent_id for variant queries
CREATE INDEX IF NOT EXISTS idx_products_parent_id
    ON products(parent_id)
    WHERE parent_id IS NOT NULL;

-- GIN index on variant_attributes for JSONB queries
CREATE INDEX IF NOT EXISTS idx_products_attributes
    ON products USING GIN (variant_attributes);

-- Composite index for template queries
CREATE INDEX IF NOT EXISTS idx_products_template
    ON products(parent_id)
    WHERE parent_id IS NOT NULL;

-- 添加约束确保变体数据完整性
-- Constraint: A product cannot be both a template and a variant
ALTER TABLE products ADD CONSTRAINT chk_template_variant_mutually_exclusive
    CHECK (
        NOT (
            is_template = true
            AND parent_id IS NOT NULL
        )
    );

-- 创建检查约束确保variant_attributes是数组
ALTER TABLE products ADD CONSTRAINT chk_variant_attributes_is_array
    CHECK (
        variant_attributes IS NULL
        OR jsonb_typeof(variant_attributes) = 'array'
    );

-- 更新现有产品为非模板（默认行为）
-- Update existing products to be non-templates (default behavior)
-- 此操作已经在字段默认值中处理，无需额外SQL

-- 创建注释
COMMENT ON TABLE products IS '产品表 - 已扩展支持产品变体功能';

COMMIT;

-- 验证迁移
-- Verification Query
-- 运行以下查询验证迁移是否成功：
-- SELECT
--     column_name,
--     data_type,
--     column_default,
--     is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'products'
-- AND column_name IN ('is_template', 'parent_id', 'variant_attributes')
-- ORDER BY column_name;
