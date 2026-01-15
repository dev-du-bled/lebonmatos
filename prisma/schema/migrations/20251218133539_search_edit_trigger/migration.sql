CREATE OR REPLACE FUNCTION notify_db_updates()
RETURNS trigger AS $$
DECLARE
  payload JSON;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    payload = json_build_object(
      'id', OLD.id,
      'table', TG_TABLE_NAME,
      'operation', TG_OP,
      'data', row_to_json(OLD)
    );
  ELSE
    payload = json_build_object(
      'id', NEW.id,
      'table', TG_TABLE_NAME,
      'operation', TG_OP,
      'data', row_to_json(NEW)
    );
  END IF;

  PERFORM pg_notify('db_update', payload::text);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;


-- Annoyingly we have to create a trigger per table by hand,  as far as i could find,
-- there's no way to tell postgres to create one trigger on an array of tables
CREATE TRIGGER meilisearch_sync_posts
AFTER INSERT OR UPDATE OR DELETE ON post
FOR EACH ROW EXECUTE FUNCTION notify_db_updates();

CREATE TRIGGER meilisearch_sync_components
AFTER INSERT OR UPDATE OR DELETE ON component
FOR EACH ROW EXECUTE FUNCTION notify_db_updates();

CREATE TRIGGER meilisearch_sync_cpu
AFTER INSERT OR UPDATE OR DELETE ON cpu
FOR EACH ROW EXECUTE FUNCTION notify_db_updates();

CREATE TRIGGER meilisearch_sync_gpu
AFTER INSERT OR UPDATE OR DELETE ON gpu
FOR EACH ROW EXECUTE FUNCTION notify_db_updates();

CREATE TRIGGER meilisearch_sync_motherboard
AFTER INSERT OR UPDATE OR DELETE ON motherboard
FOR EACH ROW EXECUTE FUNCTION notify_db_updates();

CREATE TRIGGER meilisearch_sync_ram
AFTER INSERT OR UPDATE OR DELETE ON ram
FOR EACH ROW EXECUTE FUNCTION notify_db_updates();

CREATE TRIGGER meilisearch_sync_ssd
AFTER INSERT OR UPDATE OR DELETE ON ssd
FOR EACH ROW EXECUTE FUNCTION notify_db_updates();

CREATE TRIGGER meilisearch_sync_hdd
AFTER INSERT OR UPDATE OR DELETE ON hdd
FOR EACH ROW EXECUTE FUNCTION notify_db_updates();

CREATE TRIGGER meilisearch_sync_powerSupply
AFTER INSERT OR UPDATE OR DELETE ON "powerSupply"
FOR EACH ROW EXECUTE FUNCTION notify_db_updates();

CREATE TRIGGER meilisearch_sync_cpuCooler
AFTER INSERT OR UPDATE OR DELETE ON "cpuCooler"
FOR EACH ROW EXECUTE FUNCTION notify_db_updates();

CREATE TRIGGER meilisearch_sync_case
AFTER INSERT OR UPDATE OR DELETE ON "case"
FOR EACH ROW EXECUTE FUNCTION notify_db_updates();

CREATE TRIGGER meilisearch_sync_caseFan
AFTER INSERT OR UPDATE OR DELETE ON "caseFan"
FOR EACH ROW EXECUTE FUNCTION notify_db_updates();

CREATE TRIGGER meilisearch_sync_soundCard
AFTER INSERT OR UPDATE OR DELETE ON "soundCard"
FOR EACH ROW EXECUTE FUNCTION notify_db_updates();

CREATE TRIGGER meilisearch_sync_wirelessNetworkCard
AFTER INSERT OR UPDATE OR DELETE ON "wirelessNetworkCard"
FOR EACH ROW EXECUTE FUNCTION notify_db_updates();
