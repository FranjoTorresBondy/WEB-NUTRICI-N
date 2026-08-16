-- ══════════════════════════════════════════════════════════════════
-- BULK: Crear pacientes en auth.users + patient_profiles
-- Usuario: primer nombre (ej: jorge)
-- Contrasena: mismo primer nombre (ej: jorge)
-- Ejecutar en Supabase SQL Editor
-- ══════════════════════════════════════════════════════════════════

DO $$
DECLARE v UUID;
BEGIN

-- jorge-orocoy | jorge / jorge
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','jorge@plan',crypt('jorge',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'jorge-orocoy','Jorge Orocoy');

-- adrian-tamayo | adrian.tamayo / adrian.tamayo
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','adrian.tamayo@plan',crypt('adrian.tamayo',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'adrian-tamayo','Adrian Tamayo');

-- alejandro-roman | alejandro / alejandro
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','alejandro@plan',crypt('alejandro',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'alejandro-roman','Alejandro Roman');

-- alessia-zucchetti | alessia / alessia
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','alessia@plan',crypt('alessia',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'alessia-zucchetti','Alessia Zucchetti');

-- andrea-hinojosa | andrea / andrea
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','andrea@plan',crypt('andrea',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'andrea-hinojosa','Andrea Hinojosa');

-- andres | andres / andres
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','andres@plan',crypt('andres',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'andres','Andres');

-- araceli-suarez | araceli / araceli
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','araceli@plan',crypt('araceli',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'araceli-suarez','Araceli Suarez');

-- arturo-fernandez | arturo / arturo
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','arturo@plan',crypt('arturo',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'arturo-fernandez','Arturo Fernandez');

-- bruno-bastos | bruno / bruno
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','bruno@plan',crypt('bruno',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'bruno-bastos','Bruno Bastos');

-- cadmo-garibaldi | cadmo / cadmo
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','cadmo@plan',crypt('cadmo',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'cadmo-garibaldi','Cadmo Garibaldi');

-- chiara-bitrich | chiara / chiara
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','chiara@plan',crypt('chiara',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'chiara-bitrich','Chiara Bitrich');

-- cristian-contreras | cristian / cristian
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','cristian@plan',crypt('cristian',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'cristian-contreras','Cristian Contreras');

-- diego-cornejo | diego.cornejo / diego.cornejo
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','diego.cornejo@plan',crypt('diego.cornejo',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'diego-cornejo','Diego Cornejo');

-- diego-lobaton | diego.lobaton / diego.lobaton
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','diego.lobaton@plan',crypt('diego.lobaton',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'diego-lobaton','Diego Lobaton');

-- diego-lopez | diego.lopez / diego.lopez
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','diego.lopez@plan',crypt('diego.lopez',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'diego-lopez','Diego Lopez');

-- enzo-risco | enzo / enzo
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','enzo@plan',crypt('enzo',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'enzo-risco','Enzo Risco');

-- estephano-vigil | estephano / estephano
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','estephano@plan',crypt('estephano',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'estephano-vigil','Estephano Vigil');

-- evelyn-sierra | evelyn / evelyn
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','evelyn@plan',crypt('evelyn',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'evelyn-sierra','Evelyn');

-- ezio-perez | ezio / ezio
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','ezio@plan',crypt('ezio',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'ezio-perez','Ezio Perez');

-- fabrizio-valderrama | fabrizio.valderrama / fabrizio.valderrama
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','fabrizio.valderrama@plan',crypt('fabrizio.valderrama',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'fabrizio-valderrama','Fabrizio Valderrama');

-- fatima-palomino | fatima / fatima
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','fatima@plan',crypt('fatima',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'fatima-palomino','Fatima Palomino');

-- fernando-penagos | fernando / fernando
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','fernando@plan',crypt('fernando',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'fernando-penagos','Fernando Penagos');

-- franco-gervasi | franco / franco
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','franco@plan',crypt('franco',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'franco-gervasi','Franco Gervasi');

-- giancarlo-bambaren | giancarlo.bambaren / giancarlo.bambaren
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','giancarlo.bambaren@plan',crypt('giancarlo.bambaren',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'giancarlo-bambaren','Giancarlo Bambaren');

-- giancarlo-cassia | giancarlo.cassia / giancarlo.cassia
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','giancarlo.cassia@plan',crypt('giancarlo.cassia',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'giancarlo-cassia','Giancarlo Cassia');

-- giorgio-badani | giorgio / giorgio
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','giorgio@plan',crypt('giorgio',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'giorgio-badani','Giorgio Badani');

-- gonzalo-gamboa | gonzalo / gonzalo
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','gonzalo@plan',crypt('gonzalo',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'gonzalo-gamboa','Gonzalo Gamboa');

-- hugo | hugo / hugo
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','hugo@plan',crypt('hugo',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'hugo','Hugo');

-- james-hole | james / james
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','james@plan',crypt('james',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'james-hole','James Hole');

-- ivan-joaquin | ivan / ivan
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','ivan@plan',crypt('ivan',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'ivan-joaquin','Ivan Joaquin');

-- carlo-villamar | carlo / carlo
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','carlo@plan',crypt('carlo',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'carlo-villamar','Carlo');

-- javier-vargas | javier / javier
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','javier@plan',crypt('javier',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'javier-vargas','Javier Vargas');

-- joaquin-angulo | joaquin / joaquin
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','joaquin@plan',crypt('joaquin',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'joaquin-angulo','Joaquin Angulo');

-- johan-naveda | johan / johan
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','johan@plan',crypt('johan',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'johan-naveda','Johan Naveda');

-- kristel-centurion | kristel / kristel
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','kristel@plan',crypt('kristel',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'kristel-centurion','Kristel Centurion');

-- marcelo-gago | marcelo.gago / marcelo.gago
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','marcelo.gago@plan',crypt('marcelo.gago',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'marcelo-gago','Marcelo Gago');

-- maria-augusta | maria.augusta / maria.augusta
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','maria.augusta@plan',crypt('maria.augusta',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'maria-augusta','Maria Augusta');

-- mateo-cotrina | mateo / mateo
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','mateo@plan',crypt('mateo',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'mateo-cotrina','Mateo Cotrina');

-- matias-carrion | matias / matias
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','matias@plan',crypt('matias',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'matias-carrion','Matias Carrion');

-- mauricio-vergani | mauricio / mauricio
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','mauricio@plan',crypt('mauricio',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'mauricio-vergani','Mauricio Vergani');

-- miguel-yzaga | miguel / miguel
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','miguel@plan',crypt('miguel',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'miguel-yzaga','Miguel Yzaga');

-- rodrigo-rubio | rodrigo / rodrigo
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','rodrigo@plan',crypt('rodrigo',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'rodrigo-rubio','Rodrigo Rubio');

-- salma-achtar | salma / salma
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','salma@plan',crypt('salma',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'salma-achtar','Salma Achtar');

-- salvatore-cabanillas | salvatore / salvatore
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','salvatore@plan',crypt('salvatore',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'salvatore-cabanillas','Salvatore Cabanillas');

-- santiago-bedoya | santiago / santiago
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','santiago@plan',crypt('santiago',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'santiago-bedoya','Santiago Bedoya');

-- sebastian-merea | sebastian.merea / sebastian.merea
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','sebastian.merea@plan',crypt('sebastian.merea',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'sebastian-merea','Sebastian Merea');

-- sebastian-roman | sebastian.roman / sebastian.roman
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','sebastian.roman@plan',crypt('sebastian.roman',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'sebastian-roman','Sebastian Roman');

-- stephan-braedt | stephan / stephan
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','stephan@plan',crypt('stephan',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'stephan-braedt','Stephan Braedt');

-- tomas-ruiz | tomas / tomas
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','tomas@plan',crypt('tomas',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'tomas-ruiz','Tomas Ruiz');

-- valeria-salazar | valeria.salazar / valeria.salazar
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','valeria.salazar@plan',crypt('valeria.salazar',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'valeria-salazar','Valeria Salazar');

-- vasco-valera | vasco / vasco
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','vasco@plan',crypt('vasco',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'vasco-valera','Vasco Valera');

-- victor-bazan | victor / victor
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','victor@plan',crypt('victor',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'victor-bazan','Victor Bazan');

-- vittorio-calderon | vittorio / vittorio
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','vittorio@plan',crypt('vittorio',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'vittorio-calderon','Vittorio Calderon');

-- ximena | ximena / ximena
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','ximena@plan',crypt('ximena',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'ximena','Ximena');

-- ioanis-patsias | ioanis / ioanis
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','ioanis@plan',crypt('ioanis',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'ioanis-patsias','Ioanis Patsias');

-- valeria-aguilera | valeria.aguilera / valeria.aguilera
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','valeria.aguilera@plan',crypt('valeria.aguilera',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'valeria-aguilera','Valeria Aguilera');

-- adrian-castro | adrian.castro / adrian.castro
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','adrian.castro@plan',crypt('adrian.castro',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'adrian-castro','Adrian Castro');

-- alejandra-loayza | alejandra.loayza / alejandra.loayza
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','alejandra.loayza@plan',crypt('alejandra.loayza',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'alejandra-loayza','Alejandra Loayza');

-- alejandra-meza | alejandra.meza / alejandra.meza
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','alejandra.meza@plan',crypt('alejandra.meza',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'alejandra-meza','Alejandra Meza');

-- alejandro-cerna | alejandro.cerna / alejandro.cerna
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','alejandro.cerna@plan',crypt('alejandro.cerna',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'alejandro-cerna','Alejandro Cerna');

-- alex-rios | alex / alex
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','alex@plan',crypt('alex',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'alex-rios','Alex Rios');

-- anthony-lee | anthony / anthony
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','anthony@plan',crypt('anthony',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'anthony-lee','Anthony Lee');

-- aurelio | aurelio / aurelio
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','aurelio@plan',crypt('aurelio',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'aurelio','Aurelio');

-- debora-withers | debora / debora
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','debora@plan',crypt('debora',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'debora-withers','Debora Withers');

-- fabrizio-vasallo | fabrizio.vasallo / fabrizio.vasallo
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','fabrizio.vasallo@plan',crypt('fabrizio.vasallo',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'fabrizio-vasallo','Fabrizio Vasallo');

-- gabriel-martinez | gabriel / gabriel
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','gabriel@plan',crypt('gabriel',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'gabriel-martinez','Gabriel Martinez');

-- george-alarcon | george / george
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','george@plan',crypt('george',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'george-alarcon','George Alarcon');

-- gisela-schrader | gisela / gisela
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','gisela@plan',crypt('gisela',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'gisela-schrader','Gisela Schrader');

-- ian-escuza | ian / ian
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','ian@plan',crypt('ian',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'ian-escuza','Ian Escuza');

-- javier-lazo | javier.lazo / javier.lazo
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','javier.lazo@plan',crypt('javier.lazo',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'javier-lazo','Javier Lazo');

-- joaquin-llona | joaquin.llona / joaquin.llona
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','joaquin.llona@plan',crypt('joaquin.llona',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'joaquin-llona','Joaquin Llona');

-- juan-de-dios | juan / juan
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','juan@plan',crypt('juan',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'juan-de-dios','Juan de Dios');

-- kurt-schrader | kurt / kurt
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','kurt@plan',crypt('kurt',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'kurt-schrader','Kurt Schrader');

-- marcelo-prado | marcelo.prado / marcelo.prado
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','marcelo.prado@plan',crypt('marcelo.prado',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'marcelo-prado','Marcelo Prado');

-- maria-jose-figueroa | maria.jose / maria.jose
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','maria.jose@plan',crypt('maria.jose',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'maria-jose-figueroa','Maria Jose Figueroa');

-- naghib | naghib / naghib
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','naghib@plan',crypt('naghib',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'naghib','Naghib');

-- nicolas-holz | nicolas / nicolas
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','nicolas@plan',crypt('nicolas',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'nicolas-holz','Nicolas Holz');

-- oscar-ravello | oscar / oscar
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','oscar@plan',crypt('oscar',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'oscar-ravello','Oscar Ravello');

-- paula-camino | paula / paula
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','paula@plan',crypt('paula',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'paula-camino','Paula Camino');

-- renzo-acosta | renzo / renzo
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','renzo@plan',crypt('renzo',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'renzo-acosta','Renzo Acosta');

-- ricardo-acosta | ricardo / ricardo
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','ricardo@plan',crypt('ricardo',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'ricardo-acosta','Ricardo Acosta');

-- ruben-rios | ruben / ruben
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','ruben@plan',crypt('ruben',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'ruben-rios','Ruben Rios');

-- salvador-aguirre | salvador / salvador
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','salvador@plan',crypt('salvador',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'salvador-aguirre','Salvador Aguirre');

-- thiago-gago | thiago / thiago
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','thiago@plan',crypt('thiago',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'thiago-gago','Thiago Gago');

-- valeria-rojas | valeria.rojas / valeria.rojas
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','valeria.rojas@plan',crypt('valeria.rojas',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'valeria-rojas','Valeria Rojas');

-- viviana-caceres | viviana / viviana
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,confirmation_token,recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','viviana@plan',crypt('viviana',gen_salt('bf')),now(),now(),now(),'','') RETURNING id INTO v;
INSERT INTO patient_profiles(user_id,slug,nombre) VALUES(v,'viviana-caceres','Viviana Caceres');

END $$;
