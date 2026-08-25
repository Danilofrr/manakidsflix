CREATE POLICY "Users can update own subscription plan"
ON public.subscriptions
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());