CREATE OR REPLACE FUNCTION notify_db_updates()
RETURNS trigger AS $$
DECLARE
  payload JSON;
  minimal_data JSON;
BEGIN
  -- Only include the specific fields needed by the sync consumer,
  -- instead of row_to_json(NEW/OLD) which can exceed pg_notify's 8000 byte limit.
  IF (TG_TABLE_NAME = 'Location') THEN
    IF (TG_OP = 'DELETE') THEN
      minimal_data = json_build_object('postId', OLD."postId");
    ELSE
      minimal_data = json_build_object('postId', NEW."postId");
    END IF;
  ELSIF (TG_TABLE_NAME = 'Component') THEN
    IF (TG_OP = 'DELETE') THEN
      minimal_data = json_build_object('type', OLD."type");
    ELSE
      minimal_data = json_build_object('type', NEW."type");
    END IF;
  ELSIF (TG_TABLE_NAME IN ('Cpu','Gpu','Motherboard','Ram','Ssd','Hdd','Psu','CpuCooler','Case','CaseFan','SoundCard','WirelessNetworkCard')) THEN
    IF (TG_OP = 'DELETE') THEN
      minimal_data = json_build_object('componentId', OLD."componentId");
    ELSE
      minimal_data = json_build_object('componentId', NEW."componentId");
    END IF;
  ELSE
    minimal_data = '{}'::json;
  END IF;

  payload = json_build_object(
    'id', COALESCE(NEW.id, OLD.id),
    'table', TG_TABLE_NAME,
    'operation', TG_OP,
    'data', minimal_data
  );

  PERFORM pg_notify('db_update', payload::text);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
