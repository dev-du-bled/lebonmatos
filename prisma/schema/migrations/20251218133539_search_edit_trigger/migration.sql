CREATE OR REPLACE FUNCTION notify_db_updates()
RETURNS trigger AS $$
DECLARE
  payload JSON;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    payload = json_build_object(
      'id', OLD.id,
      'table', TG_TABLE_NAME,
      'operation', TG_OP
    );
  ELSE
    payload = json_build_object(
      'id', NEW.id,
      'table', TG_TABLE_NAME,
      'operation', TG_OP
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
