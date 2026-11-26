-- Pega todo esto en Supabase > SQL Editor > Run
create table contador(id int primary key default 1 check(id=1), total bigint not null default 0);
insert into contador values(1,0);
create table contador_log(t timestamptz default now());
create table preguntas(id uuid primary key default gen_random_uuid(),
 texto text not null check(char_length(texto) between 5 and 600), respuesta text,
 estado text not null default 'pendiente' check(estado in('pendiente','aprobada','rechazada')), creada timestamptz default now());
create table frases(id uuid primary key default gen_random_uuid(), tipo text default 'reflexion', texto text not null, ref text, activa boolean default true);
create table galeria(pos int primary key check(pos between 1 and 6), url text not null, alt text);
create table admins(user_id uuid primary key references auth.users on delete cascade);
create function is_admin() returns boolean language sql security definer stable set search_path=public as
$$ select exists(select 1 from admins where user_id=auth.uid()) $$;
alter table contador enable row level security; alter table contador_log enable row level security;
alter table preguntas enable row level security; alter table frases enable row level security;
alter table galeria enable row level security; alter table admins enable row level security;
create policy c_leer on contador for select using(true);
create policy p_enviar on preguntas for insert to anon,authenticated with check(estado='pendiente' and respuesta is null);
create policy p_publicas on preguntas for select using(estado='aprobada');
create policy p_admin on preguntas for all using(is_admin()) with check(is_admin());
create policy f_leer on frases for select using(activa);
create policy f_admin on frases for all using(is_admin()) with check(is_admin());
create policy g_leer on galeria for select using(true);
create policy g_admin on galeria for all using(is_admin()) with check(is_admin());
create policy a_yo on admins for select to authenticated using(user_id=auth.uid());
-- Contador atomico con freno anti-spam (max 25 sumas / 10 s en total)
create function cuenta_conmigo() returns bigint language plpgsql security definer set search_path=public as $$
declare n bigint; begin
 if (select count(*) from contador_log where t>now()-interval '10 seconds')>=25 then raise exception 'demasiadas'; end if;
 insert into contador_log default values; delete from contador_log where t<now()-interval '1 minute';
 update contador set total=total+1 where id=1 returning total into n; return n; end $$;
revoke all on function cuenta_conmigo() from public; grant execute on function cuenta_conmigo() to anon,authenticated;
alter publication supabase_realtime add table contador;
-- Almacenamiento de fotos
insert into storage.buckets(id,name,public) values('galeria','galeria',true);
create policy s_leer on storage.objects for select using(bucket_id='galeria');
create policy s_admin on storage.objects for all using(bucket_id='galeria' and is_admin()) with check(bucket_id='galeria' and is_admin());
-- Despues de crear tu usuario en Authentication > Users, hazlo administrador:
-- insert into admins select id from auth.users where email='TU_CORREO';

-- 50 frases y versiculos iniciales
insert into frases(tipo,texto,ref) values
('versiculo','Yo soy el camino, y la verdad, y la vida; nadie viene al Padre, sino por mí.','Juan 14:6'),
('versiculo','Todo lo puedo en Cristo que me fortalece.','Filipenses 4:13'),
('versiculo','Yo sé los pensamientos que tengo acerca de vosotros, pensamientos de paz, y no de mal, para daros el fin que esperáis.','Jeremías 29:11'),
('versiculo','Esfuérzate y sé valiente; no temas ni desmayes, porque Jehová tu Dios estará contigo dondequiera que vayas.','Josué 1:9'),
('versiculo','Lámpara es a mis pies tu palabra, y lumbrera a mi camino.','Salmo 119:105'),
('versiculo','Fíate de Jehová de todo tu corazón, y no te apoyes en tu propia prudencia.','Proverbios 3:5'),
('versiculo','No temas, porque yo estoy contigo; no desmayes, porque yo soy tu Dios que te esfuerzo.','Isaías 41:10'),
('versiculo','Venid a mí todos los que estáis trabajados y cargados, y yo os haré descansar.','Mateo 11:28'),
('versiculo','Ninguno tenga en poco tu juventud, sino sé ejemplo de los creyentes.','1 Timoteo 4:12'),
('versiculo','Acuérdate de tu Creador en los días de tu juventud.','Eclesiastés 12:1'),
('versiculo','Jehová es mi pastor; nada me faltará.','Salmo 23:1'),
('versiculo','A los que aman a Dios, todas las cosas les ayudan a bien.','Romanos 8:28'),
('versiculo','Id, y haced discípulos a todas las naciones.','Mateo 28:19'),
('versiculo','¡Mirad cuán bueno y cuán delicioso es habitar los hermanos juntos en armonía!','Salmo 133:1'),
('versiculo','Sobrellevad los unos las cargas de los otros, y cumplid así la ley de Cristo.','Gálatas 6:2'),
('versiculo','De tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.','Juan 3:16'),
('versiculo','Dios es nuestro amparo y fortaleza, nuestro pronto auxilio en las tribulaciones.','Salmo 46:1'),
('versiculo','Vosotros sois la luz del mundo.','Mateo 5:14'),
('versiculo','Considerémonos unos a otros para estimularnos al amor y a las buenas obras.','Hebreos 10:24'),
('versiculo','No os conforméis a este siglo, sino transformaos por medio de la renovación de vuestro entendimiento.','Romanos 12:2'),
('promesa','Yo estoy con vosotros todos los días, hasta el fin del mundo.','Mateo 28:20'),
('promesa','Los que esperan a Jehová tendrán nuevas fuerzas; levantarán alas como las águilas.','Isaías 40:31'),
('promesa','La paz os dejo, mi paz os doy; yo no os la doy como el mundo la da.','Juan 14:27'),
('promesa','Cercano está Jehová a los quebrantados de corazón.','Salmo 34:18'),
('promesa','Él no te dejará, ni te desamparará.','Deuteronomio 31:6'),
('promesa','Mi Dios suplirá todo lo que os falta conforme a sus riquezas en gloria en Cristo Jesús.','Filipenses 4:19'),
('promesa','Nuevas son cada mañana; grande es tu fidelidad.','Lamentaciones 3:22-23'),
('promesa','Yo he venido para que tengan vida, y para que la tengan en abundancia.','Juan 10:10'),
('promesa','Acercaos a Dios, y él se acercará a vosotros.','Santiago 4:8'),
('promesa','Deléitate asimismo en Jehová, y él te concederá las peticiones de tu corazón.','Salmo 37:4'),
('promesa','Cuando pases por las aguas, yo estaré contigo.','Isaías 43:2'),
('promesa','Si alguno está en Cristo, nueva criatura es; las cosas viejas pasaron; he aquí todas son hechas nuevas.','2 Corintios 5:17'),
('promesa','Si confesamos nuestros pecados, él es fiel y justo para perdonarnos.','1 Juan 1:9'),
('promesa','Mi socorro viene de Jehová, que hizo los cielos y la tierra.','Salmo 121:2'),
('promesa','Pedid, y se os dará; buscad, y hallaréis; llamad, y se os abrirá.','Mateo 7:7'),
('reflexion','No tienes que ser perfecto para ser parte. Solo necesitas dar el primer paso.',''),
('reflexion','Tu historia no terminó donde te caíste. Dios sigue escribiendo.',''),
('reflexion','Nadie camina solo en Nexus. Aquí siempre hay un lugar para ti.',''),
('reflexion','Jesús no te pidió que fueras fuerte: te invitó a venir como estás.',''),
('reflexion','Lo que hoy te pesa, Dios ya lo conoce y puede sostenerlo.',''),
('reflexion','Servir a otros es una de las formas más bonitas de adorar.',''),
('reflexion','Una amistad con Cristo cambia la forma en que ves todo lo demás.',''),
('reflexion','Tu juventud no es una excusa, es una oportunidad.',''),
('reflexion','Cuando todo se mueve, Jesús sigue siendo el centro firme.',''),
('reflexion','La unidad no es pensar igual: es caminar juntos hacia Jesús.',''),
('reflexion','Hay personas esperando que alguien como tú les hable de esperanza.',''),
('reflexion','Orar es hablar con Quien nunca se cansa de escucharte.',''),
('reflexion','Dios no desperdicia nada: ni tus luchas, ni tus talentos, ni tu tiempo.',''),
('reflexion','Ser constante en lo pequeño también es fe.',''),
('reflexion','Un corazón agradecido encuentra luz hasta en los días nublados.','');
