/* Create a trigger that automatically updates the timestamp */
CREATE OR REPLACE FUNCTION upd_timestamp() RETURNS TRIGGER 
LANGUAGE plpgsql
AS
$$
BEGIN
  NEW.modified = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

CREATE TRIGGER timestamp_trigger 
  BEFORE UPDATE
  ON heartbeats
  FOR EACH ROW
  EXECUTE PROCEDURE upd_timestamp();
