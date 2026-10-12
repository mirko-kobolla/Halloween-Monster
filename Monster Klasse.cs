using System;

public class Monster
{
	public Monster()
	{
        public string Name { get; set; }
    public int Siegpunkte {  get; set; }
    public int AktuelleSiegpunkte { get; set; }

    public List<Waffe> Beute { get; set; } = new List<Waffe>();

    public bool IstEingefroren {  get; set; }
    public int GiftSchadenProZug {  get; set; }
    public int DynamitSchadenRundenZaeler { get; set; }
	}
}
// ===================================================================
// 1. MONSTER ERSTELLEN (Mit echten Waffen-Objekten als Beute!)
// ===================================================================
Monster kuerbis = new Monster
{
    Name = "Kürbis",
    Siegpunkte = 5,
    Beute = new List<Waffe> { new Waffe { Name = "Gift", Typ = WaffenTyp.Gift, Staerke = 1, IstEinwegWaffe = true } }
};

Monster baum = new Monster
{
    Name = "Baum",
    Siegpunkte = 9,
    Beute = new List<Waffe> {
                    new Waffe { Name = "Eis", Typ = WaffenTyp.Eis, Staerke = 3, IstEinwegWaffe = true },
                    new Waffe { Name = "Gekreuzte Schwerter", Typ = WaffenTyp.GekreuzteSchwerter, Staerke = 4, IstEinwegWaffe = true }
                }
};

Monster sensenmann = new Monster
{
    Name = "Sensenmann",
    Siegpunkte = 16,
    Beute = new List<Waffe> {
                    new Waffe { Name = "Gekreuzte Schwerter", Typ = WaffenTyp.GekreuzteSchwerter, Staerke = 4, IstEinwegWaffe = true },
                    new Waffe { Name = "Granate", Typ = WaffenTyp.Granate, Staerke = 6, IstEinwegWaffe = true }
                }
};

Monster mumie = new Monster
{
    Name = "Mumie",
    Siegpunkte = 7,
    Beute = new List<Waffe> {
                    new Waffe { Name = "Granate", Typ = WaffenTyp.Granate, Staerke = 6, IstEinwegWaffe = true },
                    new Waffe { Name = "Gift", Typ = WaffenTyp.Gift, Staerke = 1, IstEinwegWaffe = true }
                }
};

Monster teufel = new Monster
{
    Name = "Teufel",
    Siegpunkte = 10,
    Beute = new List<Waffe> {
                    new Waffe { Name = "Eis", Typ = WaffenTyp.Eis, Staerke = 3, IstEinwegWaffe = true },
                    new Waffe { Name = "Dynamit", Typ = WaffenTyp.Dynamit, Staerke = 10, IstEinwegWaffe = true }
                }
};

Monster vampir = new Monster
{
    Name = "Vampir",
    Siegpunkte = 6,
    Beute = new List<Waffe> { new Waffe { Name = "Granate", Typ = WaffenTyp.Granate, Staerke = 6, IstEinwegWaffe = true } }
};

Monster hexe = new Monster
{
    Name = "Hexe",
    Siegpunkte = 15,
    Beute = new List<Waffe> { new Waffe { Name = "Dynamit", Typ = WaffenTyp.Dynamit, Staerke = 10, IstEinwegWaffe = true } }
};

Monster medusa = new Monster
{
    Name = "Medusa",
    Siegpunkte = 15,
    Beute = new List<Waffe>()
};

Monster clown = new Monster
{
    Name = "Clown",
    Siegpunkte = 12,
    Beute = new List<Waffe> {
                    new Waffe { Name = "Granate (A)", Typ = WaffenTyp.Granate, Staerke = 6, IstEinwegWaffe = true },
                    new Waffe { Name = "Granate (B)", Typ = WaffenTyp.Granate, Staerke = 6, IstEinwegWaffe = true }
                }
};
