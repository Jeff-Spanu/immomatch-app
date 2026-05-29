-- Setup RLS policies pour ImmoMatch
-- Exécuter une fois dans Supabase SQL Editor

-- Table matches
ALTER TABLE IF EXISTS matches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "insert_matches" ON matches;
DROP POLICY IF EXISTS "select_matches" ON matches;
DROP POLICY IF EXISTS "delete_matches" ON matches;
DROP POLICY IF EXISTS "update_matches" ON matches;
CREATE POLICY "insert_matches" ON matches FOR INSERT WITH CHECK (true);
CREATE POLICY "select_matches" ON matches FOR SELECT USING (true);
CREATE POLICY "delete_matches" ON matches FOR DELETE USING (true);
CREATE POLICY "update_matches" ON matches FOR UPDATE USING (true);

-- Table vendeurs
ALTER TABLE IF EXISTS vendeurs ADD COLUMN IF NOT EXISTS prix_vente numeric DEFAULT 0;
ALTER TABLE IF EXISTS vendeurs ADD COLUMN IF NOT EXISTS apporteur_affaires text;

-- Table acquereurs  
ALTER TABLE IF EXISTS acquereurs ADD COLUMN IF NOT EXISTS apporteur_affaires text;

-- Remplir prix_vente
UPDATE vendeurs SET prix_vente = budget WHERE (prix_vente IS NULL OR prix_vente = 0) AND budget > 0;

-- Corrections depuis notes
UPDATE vendeurs SET prix_vente = 189000, type_bien = 'Appartement', secteur = 'Saint-Pierre' WHERE nom ILIKE '%MEIER%';
UPDATE vendeurs SET prix_vente = 427000, type_bien = 'Maison', secteur = 'L''Étang-Salé' WHERE nom ILIKE '%TRAYAUD%';
UPDATE vendeurs SET prix_vente = 200000, type_bien = 'Maison', secteur = 'Saint-Pierre' WHERE nom ILIKE '%Louiset%';
UPDATE vendeurs SET type_bien = 'Maison', secteur = 'Saint-Pierre' WHERE nom ILIKE '%Hugues Dijoux%';
UPDATE vendeurs SET type_bien = 'Immeuble', secteur = 'Saint-Pierre' WHERE nom ILIKE '%Géorget%';
UPDATE vendeurs SET type_bien = 'Terrain+Maison', secteur = 'Le Tampon' WHERE nom ILIKE '%Josian%';
UPDATE vendeurs SET type_bien = 'Immeuble Commerce', secteur = 'Le Tampon' WHERE nom ILIKE '%Vitry%';
