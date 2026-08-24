CREATE POLICY "Midia visivel para todos" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id IN ('media', 'videos'));

CREATE POLICY "Admin envia midia" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('media', 'videos') AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin atualiza midia" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id IN ('media', 'videos') AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id IN ('media', 'videos') AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin apaga midia" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id IN ('media', 'videos') AND public.has_role(auth.uid(), 'admin'));