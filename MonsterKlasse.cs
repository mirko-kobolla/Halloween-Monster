using System;

public class Monster
{
        public string Name { get; set; }
        public int Siegpunkte { get; set; }
        public int AktuelleLebenspunkte { get; set; }

        // GEÄNDERT: Jetzt eine Liste aus echten Waffentypen statt Strings!
        public List<Waffe> Beute { get; set; } = new List<Waffe>();

        // Spezialeffekte
        public bool IstEingefroren { get; set; }
        public int GiftSchadenProZug { get; set; }
        public int DynamitSchadenRundenZaehler { get; set; }
}
