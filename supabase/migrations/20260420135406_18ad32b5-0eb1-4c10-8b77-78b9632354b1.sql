
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_product_led uuid;
  v_product_solar uuid;
BEGIN
  -- 1) 个人档案
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;

  -- 2) 示例客户 ×3
  INSERT INTO public.customers (user_id, name, company, country, email, phone, tier, ai_score, total_orders, total_value, last_contact_at, channels, status, tags, notes)
  VALUES
    (NEW.id, 'John Smith', 'TechCorp Ltd.', '美国', 'john@techcorp.com', '+1 555-0123', 'A', 92, 8, 125000, now() - interval '1 day',
     ARRAY['WhatsApp','Email'], 'active', ARRAY['LED大客户','长期合作'], '示例客户：高价值长期合作伙伴'),
    (NEW.id, 'Maria Garcia', 'Europa Imports', '西班牙', 'maria@europa.es', '+34 600-12345', 'B', 78, 3, 42000, now() - interval '3 days',
     ARRAY['Email'], 'nurturing', ARRAY['欧洲','潜力客户'], '示例客户：欧洲市场潜力客户'),
    (NEW.id, 'Yuki Tanaka', 'Tokyo Trading Co.', '日本', 'yuki@tokyo-trading.jp', '+81 3-1234-5678', 'B', 70, 2, 28000, now() - interval '7 days',
     ARRAY['Email','LinkedIn'], 'nurturing', ARRAY['日本','新客户'], '示例客户：日本新拓展客户');

  -- 3) 示例产品 ×2
  INSERT INTO public.products (user_id, name, sku, category, price, currency, moq, stock, image_url, factory_name, factory_rating, factory_certs, status, has_bot, views, inquiries_count, description)
  VALUES (NEW.id, 'LED 节能灯泡 9W E27', 'LED-9W-E27', 'LED 照明', 1.85, 'USD', '1000 pcs', '充足', NULL,
          '深圳光明照明厂', 5, ARRAY['CE','RoHS','FCC'], 'active', true, 1280, 24, '高效节能，使用寿命 25000 小时，适用于家庭与商业照明')
  RETURNING id INTO v_product_led;

  INSERT INTO public.products (user_id, name, sku, category, price, currency, moq, stock, image_url, factory_name, factory_rating, factory_certs, status, has_bot, views, inquiries_count, description)
  VALUES (NEW.id, '太阳能板 100W 单晶硅', 'SOLAR-100W-MONO', '新能源', 89.00, 'USD', '50 pcs', '现货', NULL,
          '江苏阳光新能源', 5, ARRAY['IEC','TUV','CE'], 'active', false, 860, 12, '高转换效率单晶硅太阳能板，适用于户用与小型商用场景')
  RETURNING id INTO v_product_solar;

  -- 4) 产品规格
  INSERT INTO public.product_specs (product_id, label, value, sort_order) VALUES
    (v_product_led, '功率', '9W', 1),
    (v_product_led, '色温', '3000K / 6500K', 2),
    (v_product_led, '电压', 'AC 85-265V', 3),
    (v_product_led, '寿命', '25000 小时', 4),
    (v_product_solar, '功率', '100W', 1),
    (v_product_solar, '电压', '18V', 2),
    (v_product_solar, '转换效率', '21.5%', 3),
    (v_product_solar, '尺寸', '1200×540×30mm', 4);

  RETURN NEW;
END;
$function$;
