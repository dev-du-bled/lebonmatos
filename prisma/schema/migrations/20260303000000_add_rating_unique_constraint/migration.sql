-- AddUniqueConstraint
CREATE UNIQUE INDEX "rating_userId_raterId_key" ON "rating"("userId", "raterId");