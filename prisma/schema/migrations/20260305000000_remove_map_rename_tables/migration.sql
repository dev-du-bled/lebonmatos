ALTER TABLE "user" RENAME TO "User";
ALTER TABLE "session" RENAME TO "Session";
ALTER TABLE "account" RENAME TO "Account";
ALTER TABLE "verification" RENAME TO "Verification";
ALTER TABLE "post" RENAME TO "Post";
ALTER TABLE "location" RENAME TO "Location";
ALTER TABLE "favorite" RENAME TO "Favorite";
ALTER TABLE "report" RENAME TO "Report";
ALTER TABLE "discussion" RENAME TO "Discussion";
ALTER TABLE "message" RENAME TO "Message";
ALTER TABLE "rating" RENAME TO "Rating";
ALTER TABLE "configuration" RENAME TO "Configuration";
ALTER TABLE "configuration_item" RENAME TO "ConfigurationItem";
ALTER TABLE "component" RENAME TO "Component";
ALTER TABLE "cpu" RENAME TO "Cpu";
ALTER TABLE "gpu" RENAME TO "Gpu";
ALTER TABLE "motherboard" RENAME TO "Motherboard";
ALTER TABLE "ram" RENAME TO "Ram";
ALTER TABLE "ssd" RENAME TO "Ssd";
ALTER TABLE "hdd" RENAME TO "Hdd";
ALTER TABLE "power_supply" RENAME TO "Psu";
ALTER TABLE "cpu_cooler" RENAME TO "CpuCooler";
ALTER TABLE "case" RENAME TO "Case";
ALTER TABLE "case_fan" RENAME TO "CaseFan";
ALTER TABLE "sound_card" RENAME TO "SoundCard";
ALTER TABLE "wireless_network_card" RENAME TO "WirelessNetworkCard";

DROP TRIGGER IF EXISTS meilisearch_sync_posts ON "Post";
DROP TRIGGER IF EXISTS meilisearch_sync_components ON "Component";
DROP TRIGGER IF EXISTS meilisearch_sync_cpu ON "Cpu";
DROP TRIGGER IF EXISTS meilisearch_sync_gpu ON "Gpu";
DROP TRIGGER IF EXISTS meilisearch_sync_motherboard ON "Motherboard";
DROP TRIGGER IF EXISTS meilisearch_sync_ram ON "Ram";
DROP TRIGGER IF EXISTS meilisearch_sync_ssd ON "Ssd";
DROP TRIGGER IF EXISTS meilisearch_sync_hdd ON "Hdd";
DROP TRIGGER IF EXISTS meilisearch_sync_powerSupply ON "Psu";
DROP TRIGGER IF EXISTS meilisearch_sync_cpuCooler ON "CpuCooler";
DROP TRIGGER IF EXISTS meilisearch_sync_case ON "Case";
DROP TRIGGER IF EXISTS meilisearch_sync_caseFan ON "CaseFan";
DROP TRIGGER IF EXISTS meilisearch_sync_soundCard ON "SoundCard";
DROP TRIGGER IF EXISTS meilisearch_sync_wirelessNetworkCard ON "WirelessNetworkCard";

CREATE TRIGGER meilisearch_sync_posts
AFTER INSERT OR UPDATE OR DELETE ON "Post"
FOR EACH ROW EXECUTE FUNCTION notify_db_updates();

CREATE TRIGGER meilisearch_sync_components
AFTER INSERT OR UPDATE OR DELETE ON "Component"
FOR EACH ROW EXECUTE FUNCTION notify_db_updates();

CREATE TRIGGER meilisearch_sync_cpu
AFTER INSERT OR UPDATE OR DELETE ON "Cpu"
FOR EACH ROW EXECUTE FUNCTION notify_db_updates();

CREATE TRIGGER meilisearch_sync_gpu
AFTER INSERT OR UPDATE OR DELETE ON "Gpu"
FOR EACH ROW EXECUTE FUNCTION notify_db_updates();

CREATE TRIGGER meilisearch_sync_motherboard
AFTER INSERT OR UPDATE OR DELETE ON "Motherboard"
FOR EACH ROW EXECUTE FUNCTION notify_db_updates();

CREATE TRIGGER meilisearch_sync_ram
AFTER INSERT OR UPDATE OR DELETE ON "Ram"
FOR EACH ROW EXECUTE FUNCTION notify_db_updates();

CREATE TRIGGER meilisearch_sync_ssd
AFTER INSERT OR UPDATE OR DELETE ON "Ssd"
FOR EACH ROW EXECUTE FUNCTION notify_db_updates();

CREATE TRIGGER meilisearch_sync_hdd
AFTER INSERT OR UPDATE OR DELETE ON "Hdd"
FOR EACH ROW EXECUTE FUNCTION notify_db_updates();

CREATE TRIGGER meilisearch_sync_psu
AFTER INSERT OR UPDATE OR DELETE ON "Psu"
FOR EACH ROW EXECUTE FUNCTION notify_db_updates();

CREATE TRIGGER meilisearch_sync_cpuCooler
AFTER INSERT OR UPDATE OR DELETE ON "CpuCooler"
FOR EACH ROW EXECUTE FUNCTION notify_db_updates();

CREATE TRIGGER meilisearch_sync_case
AFTER INSERT OR UPDATE OR DELETE ON "Case"
FOR EACH ROW EXECUTE FUNCTION notify_db_updates();

CREATE TRIGGER meilisearch_sync_caseFan
AFTER INSERT OR UPDATE OR DELETE ON "CaseFan"
FOR EACH ROW EXECUTE FUNCTION notify_db_updates();

CREATE TRIGGER meilisearch_sync_soundCard
AFTER INSERT OR UPDATE OR DELETE ON "SoundCard"
FOR EACH ROW EXECUTE FUNCTION notify_db_updates();

CREATE TRIGGER meilisearch_sync_wirelessNetworkCard
AFTER INSERT OR UPDATE OR DELETE ON "WirelessNetworkCard"
FOR EACH ROW EXECUTE FUNCTION notify_db_updates();

CREATE TRIGGER meilisearch_sync_location
AFTER INSERT OR UPDATE OR DELETE ON "Location"
FOR EACH ROW EXECUTE FUNCTION notify_db_updates();
