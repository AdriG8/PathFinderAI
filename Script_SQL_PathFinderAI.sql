-- OJO! ESTE SCRIPT SOLO FUNCIONA EN SUPABASE CON POSTGRESQL POR LA TABLA AUTH

-- 1. Habilitar la extensión para generar UUIDs
create extension if not exists "uuid-ossp";

-- 2. Crear el tipo ENUM para el nivel
create type nivel_usuario as enum ('principiante', 'medio', 'avanzado');

-- 3. Crear la tabla de Usuarios
-- La FK usa ON DELETE CASCADE para permitir eliminar usuarios de auth.users
create table if not exists public."Usuarios" (
  "ID" uuid references auth.users("id") on delete cascade not null primary key,
  "Nombre" varchar(255),
  "Apellidos" varchar(255),
  "Email" varchar(255) unique,
  "Password_hash" varchar(255),
  "Rol" varchar(50) default 'user',
  "Nivel" nivel_usuario default 'principiante',
  "created_at" timestamp with time zone default now()
);

-- 4. Crear la tabla de Roadmap
create table if not exists public."Roadmap" (
  "ID" uuid default uuid_generate_v4() primary key,
  "ID_Usuario" uuid references public."Usuarios"("ID") on delete cascade not null,
  "Titulo_Tema" varchar(255) not null,
  "Fecha_Creacion" timestamp with time zone default now(),
  "JSON" jsonb not null
);

-- 5. Crear la tabla de Metrica
create table if not exists public."Metrica" (
  "ID" uuid default uuid_generate_v4() primary key,
  "ID_Usuario" uuid references public."Usuarios"("ID") on delete cascade not null,
  "Temas_Consultados" text[] default '{}'
);

-- 6. Crear la función que se ejecuta al crear usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public."Usuarios" ("ID", "Email", "Nombre", "Apellidos", "Password_hash")
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'first_name', ''),
    COALESCE(new.raw_user_meta_data->>'last_name', ''),
    new.encrypted_password
  );

  INSERT INTO public."Metrica" ("ID_Usuario") VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Crear el trigger para INSERT (eliminar primero si existe)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 7b. Función para actualizar password_hash cuando el usuario establece/actualiza su contraseña
CREATE OR REPLACE FUNCTION public.handle_user_password_update()
RETURNS trigger AS $$
BEGIN
  IF new.encrypted_password IS DISTINCT FROM old.encrypted_password THEN
    UPDATE public."Usuarios"
    SET "Password_hash" = new.encrypted_password
    WHERE "ID" = new.id;
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7c. Trigger para UPDATE de password
DROP TRIGGER IF EXISTS on_auth_user_password_updated ON auth.users;

CREATE TRIGGER on_auth_user_password_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_user_password_update();

-- 8. (Opcional) Actualizar usuarios existentes que no tengan nivel
update public."Usuarios"
set "Nivel" = 'principiante'
where "Nivel" is null;

-- 9. Función para agregar tema consultado al array (maneja INSERT si no existe)
CREATE OR REPLACE FUNCTION public.agregar_tema_consultado(p_id_usuario uuid, p_tema text)
RETURNS void AS $$
BEGIN
  UPDATE public."Metrica"
  SET "Temas_Consultados" = array_append("Temas_Consultados", p_tema)
  WHERE "ID_Usuario" = p_id_usuario;
  
  IF NOT FOUND THEN
    INSERT INTO public."Metrica" ("ID_Usuario", "Temas_Consultados")
    VALUES (p_id_usuario, ARRAY[p_tema]);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Función para obtener temas consultados de un usuario
CREATE OR REPLACE FUNCTION public.obtener_temas_consultados(p_id_usuario uuid)
RETURNS text[] AS $$
DECLARE
  v_temas text[];
BEGIN
  SELECT "Temas_Consultados" INTO v_temas
  FROM public."Metrica"
  WHERE "ID_Usuario" = p_id_usuario;
  
  RETURN COALESCE(v_temas, '{}');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
