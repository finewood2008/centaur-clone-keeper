-- 创建 product-images 公开 storage bucket，存放产品主图与多图
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- 公开读
CREATE POLICY "Product images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- 用户只能向自己的目录（user_id 作为第一级文件夹）上传
CREATE POLICY "Users can upload own product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own product images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 创建 product-docs 私有 bucket（产品文档：报价单、规格书等）
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-docs', 'product-docs', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Product docs are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-docs');

CREATE POLICY "Users can upload own product docs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-docs'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own product docs"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-docs'
  AND auth.uid()::text = (storage.foldername(name))[1]
);