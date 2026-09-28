/**
 * @fileoverview Travel Contract Types - Enums used by travel health proposals
 * @description Mirrors InsurUp.Common.Models Travel enums (string-serialized via JsonStringEnumConverter)
 */

/**
 * Travel Option
 *
 * Coverage region for travel health insurance.
 * Seyahat sağlık sigortası için seyahat seçenekleri.
 */
export enum TravelOption {
  /** Schengen Standart (Avrupa) */
  SchengenStandard = 'SCHENGEN_STANDARD',
  /** Tüm Dünya */
  AllWorld = 'ALL_WORLD',
  /** Tüm Dünya - Yıllık Seyahat */
  AllWorldAnnual = 'ALL_WORLD_ANNUAL',
  /** Tüm Dünya (ABD / KANADA / TÜRKİYE / JAPONYA hariç) */
  AllWorldExcluding = 'ALL_WORLD_EXCLUDING',
}

/**
 * Travel Reason
 *
 * Purpose of the trip for travel health insurance.
 * Seyahat sağlık sigortası için seyahat nedenleri.
 */
export enum TravelReason {
  /** Turistik Gezi */
  TouristTrip = 'TOURIST_TRIP',
  /** İş Seyahati */
  BusinessTrip = 'BUSINESS_TRIP',
  /** Eğitim */
  Education = 'EDUCATION',
}

/**
 * Travel Country
 *
 * Destination country for travel health insurance.
 * Seyahat sağlık sigortası için hedef ülke.
 */
export enum TravelCountry {
  /** ABU DABİ */
  AbuDabi = 'ABU_DABI',
  /** ABD */
  AmerikaBirlesikDevletleri = 'AMERIKA_BIRLESIK_DEVLETLERI',
  /** ANGOLA */
  Angola = 'ANGOLA',
  /** ANTIGUA-BARBUDA */
  AntiguaBarbuda = 'ANTIGUA_BARBUDA',
  /** ARJANTİN */
  Arjantin = 'ARJANTIN',
  /** ARUBA ADASI */
  ArubaAdasi = 'ARUBA_ADASI',
  /** AVUSTRALYA */
  Avustralya = 'AVUSTRALYA',
  /** B.ARAP EMİRLİKLERİ */
  BArapEmirlikleri = 'B_ARAP_EMIRLIKLERI',
  /** BAHAMA */
  Bahama = 'BAHAMA',
  /** BAHREYN */
  Bahreyn = 'BAHREYN',
  /** BANGLADEŞ */
  Banglades = 'BANGLADES',
  /** BARBADOS */
  Barbados = 'BARBADOS',
  /** BATI SAMOA */
  BatiSamoa = 'BATI_SAMOA',
  /** BELIZE */
  Belize = 'BELIZE',
  /** BENIN */
  Benin = 'BENIN',
  /** BERMUDA */
  Bermuda = 'BERMUDA',
  /** BİRMANYA */
  Birmanya = 'BIRMANYA',
  /** BOLİVYA */
  Bolivya = 'BOLIVYA',
  /** BOTSVANA */
  Botsvana = 'BOTSVANA',
  /** BREZİLYA */
  Brezilya = 'BREZILYA',
  /** BURKINA FASO */
  BurkinaFaso = 'BURKINA_FASO',
  /** BURMA */
  Burma = 'BURMA',
  /** BURUNDI */
  Burundi = 'BURUNDI',
  /** BUTAN */
  Butan = 'BUTAN',
  /** CAYMAN ADALARI */
  CaymanAdalari = 'CAYMAN_ADALARI',
  /** CEZAYİR */
  Cezayir = 'CEZAYIR',
  /** CİBUTİ */
  Cibuti = 'CIBUTI',
  /** COOK ADASI */
  CookAdasi = 'COOK_ADASI',
  /** ÇİN HALK CUMHURİYETİ */
  CinHalkCumhuriyeti = 'CIN_HALK_CUMHURIYETI',
  /** DOMINIKA */
  Dominika = 'DOMINIKA',
  /** DUBAI */
  Dubai = 'DUBAI',
  /** EKVATOR */
  Ekvator = 'EKVATOR',
  /** EKVATOR GINESI */
  EkvatorGinesi = 'EKVATOR_GINESI',
  /** EL SALVADOR */
  ElSalvador = 'EL_SALVADOR',
  /** ENDONEZYA */
  Endonezya = 'ENDONEZYA',
  /** ERMENISTAN */
  Ermenistan = 'ERMENISTAN',
  /** ETİYOPYA */
  Etiyopya = 'ETIYOPYA',
  /** FAS */
  Fas = 'FAS',
  /** FİLDİŞİ SAHİLLERİ (ABIDJAN) */
  FildisiSahilleri = 'FILDISI_SAHILLERI_ABIDJAN',
  /** FİLİPİNLER */
  Filipinler = 'FILIPINLER',
  /** FOGO ADASI */
  FogoAdasi = 'FOGO_ADASI',
  /** GABON */
  Gabon = 'GABON',
  /** GAMBIA */
  Gambia = 'GAMBIA',
  /** GHANA */
  Ghana = 'GHANA',
  /** GINE BISSAU */
  GineBissau = 'GINE_BISSAU',
  /** GİNE */
  Gine = 'GINE',
  /** GRENADA */
  Grenada = 'GRENADA',
  /** GUATEMALA */
  Guatemala = 'GUATEMALA',
  /** GUYANA */
  Guyana = 'GUYANA',
  /** GÜNEY AFRİKA */
  GuneyAfrika = 'GUNEY_AFRIKA',
  /** HAITI */
  Haiti = 'HAITI',
  /** HİNDİSTAN */
  Hindistan = 'HINDISTAN',
  /** HONDURAS */
  Honduras = 'HONDURAS',
  /** HONG KONG */
  HongKong = 'HONG_KONG',
  /** IRAK */
  Irak = 'IRAK',
  /** İSRAİL */
  Israil = 'ISRAIL',
  /** JAMAIKA */
  Jamaika = 'JAMAIKA',
  /** JAPONYA */
  Japonya = 'JAPONYA',
  /** JOHANNESBURG */
  Johannesburg = 'JOHANNESBURG',
  /** KAMBOÇYA */
  Kambocya = 'KAMBOCYA',
  /** KAMERUN */
  Kamerun = 'KAMERUN',
  /** KANADA */
  Kanada = 'KANADA',
  /** KATAR */
  Katar = 'KATAR',
  /** KAZAKISTAN */
  Kazakistan = 'KAZAKISTAN',
  /** KENYA */
  Kenya = 'KENYA',
  /** KIRGIZİSTAN */
  Kirgizistan = 'KIRGIZISTAN',
  /** KIRIBATI */
  Kiribati = 'KIRIBATI',
  /** KOLOMBİYA */
  Kolombiya = 'KOLOMBIYA',
  /** KOMORLAR */
  Komorlar = 'KOMORLAR',
  /** KORE CUMHURİYETİ (GÜNEY) */
  KoreCumhuriyetiGuney = 'KORE_CUMHURIYETI_GUNEY',
  /** KOSTA RİKA */
  KostaRika = 'KOSTA_RIKA',
  /** KUVEYT */
  Kuveyt = 'KUVEYT',
  /** LAOS */
  Laos = 'LAOS',
  /** LESATHO */
  Lesatho = 'LESATHO',
  /** LİBERYA */
  Liberya = 'LIBERYA',
  /** LİBYA */
  Libya = 'LIBYA',
  /** LÜBNAN */
  Lubnan = 'LUBNAN',
  /** MADAGASKAR */
  Madagaskar = 'MADAGASKAR',
  /** MAKAU */
  Makau = 'MAKAU',
  /** MALAWİ */
  Malawi = 'MALAWI',
  /** MALDİV ADALARI */
  MaldivAdalari = 'MALDIV_ADALARI',
  /** MALEZYA */
  Malezya = 'MALEZYA',
  /** MALİ */
  Mali = 'MALI',
  /** MARSHAL ADALARI */
  MarshalAdalari = 'MARSHAL_ADALARI',
  /** MAURITIUS */
  Mauritius = 'MAURITIUS',
  /** MEKSİKA */
  Meksika = 'MEKSIKA',
  /** MISIR */
  Misir = 'MISIR',
  /** MOĞOLİSTAN */
  Mogolistan = 'MOGOLISTAN',
  /** MONTSERRAT */
  Montserrat = 'MONTSERRAT',
  /** MORİTANYA */
  Moritanya = 'MORITANYA',
  /** MOZAMBİK */
  Mozambik = 'MOZAMBIK',
  /** MYANMAR BİRLİĞİ */
  MyanmarBirligi = 'MYANMAR_BIRLIGI',
  /** NAMIBYA */
  Namibya = 'NAMIBYA',
  /** NAURU */
  Nauru = 'NAURU',
  /** NEPAL */
  Nepal = 'NEPAL',
  /** NIJER */
  Nijer = 'NIJER',
  /** NIKARAGUA */
  Nikaragua = 'NIKARAGUA',
  /** NİJERYA */
  Nijerya = 'NIJERYA',
  /** ORTA AFRİKA CUMHURİYETİ */
  OrtaAfrikaCumhuriyeti = 'ORTA_AFRIKA_CUMHURIYETI',
  /** ÖZBEKİSTAN */
  Ozbekistan = 'OZBEKISTAN',
  /** PAKİSTAN */
  Pakistan = 'PAKISTAN',
  /** PALAU */
  Palau = 'PALAU',
  /** PANAMA */
  Panama = 'PANAMA',
  /** PAPUA YENİ GİNE */
  PapuaYeniGine = 'PAPUA_YENI_GINE',
  /** PARAGUAY */
  Paraguay = 'PARAGUAY',
  /** PERU */
  Peru = 'PERU',
  /** PORT OF SPAIN-TRINIDAD */
  PortOfSpainTrinidad = 'PORT_OF_SPAIN_TRINIDAD',
  /** PORTO RIKO */
  PortoRiko = 'PORTO_RIKO',
  /** RUANDA */
  Ruanda = 'RUANDA',
  /** RUSYA */
  RusyaFed = 'RUSYA_FED',
  /** SAO TOME PRI */
  SaoTomePri = 'SAO_TOME_PRI',
  /** SENEGAL */
  Senegal = 'SENEGAL',
  /** SEYŞELLER */
  Seyseller = 'SEYSELLER',
  /** SIERA LEONE */
  SieraLeone = 'SIERA_LEONE',
  /** SİNGAPUR */
  Singapur = 'SINGAPUR',
  /** SOLOMON ADALARİ */
  SolomonAdalari = 'SOLOMON_ADALARI',
  /** SOMALI */
  Somali = 'SOMALI',
  /** SRİLANKA */
  SriLanka = 'SRILANKA',
  /** ST.LUCIA */
  StLucia = 'ST_LUCIA',
  /** ST.VINCENT */
  StVincent = 'ST_VINCENT',
  /** SURINAM */
  Surinam = 'SURINAM',
  /** SUUDİ ARABİSTAN */
  SuudiArabistan = 'SUUDI_ARABISTAN',
  /** ŞİLİ */
  Sili = 'SILI',
  /** TACIKISTAN */
  Tacikistan = 'TACIKISTAN',
  /** TANZANYA */
  Tanzanya = 'TANZANYA',
  /** TAYLAND */
  Tayland = 'TAYLAND',
  /** TAYVAN */
  Tayvan = 'TAYVAN',
  /** TOGO */
  Togo = 'TOGO',
  /** TONGA */
  Tonga = 'TONGA',
  /** TRINIDAD TOBAGO */
  TrinidadTobago = 'TRINIDAD_TOBAGO',
  /** TUNUS */
  Tunus = 'TUNUS',
  /** TURKS CAICOS */
  TurksCaicos = 'TURKS_CAICOS',
  /** TÜRKMENİSTAN */
  Turkmenistan = 'TURKMENISTAN',
  /** UGANDA */
  Uganda = 'UGANDA',
  /** UMMAN */
  Umman = 'UMMAN',
  /** ÜRDÜN */
  Urdun = 'URDUN',
  /** URUGUAY */
  Uruguay = 'URUGUAY',
  /** VENEZUELLA */
  Venezuela = 'VENEZUELLA',
  /** VIETNAM (BATI) */
  VietnamBati = 'VIETNAM_BATI',
  /** Y.ZELANDA */
  YeniZelanda = 'Y_ZELANDA',
  /** YEMEN */
  Yemen = 'YEMEN',
  /** ZAMBİYA */
  Zambiya = 'ZAMBIYA',
  /** ZIMBABVE */
  Zimbabve = 'ZIMBABVE',
  /** ARNAVUTLUK */
  Arnavutluk = 'ARNAVUTLUK',
  /** KARADAĞ */
  Karadag = 'KARADAG',
  /** ALMANYA */
  Almanya = 'ALMANYA',
  /** AVUSTURYA */
  Avusturya = 'AVUSTURYA',
  /** BELÇİKA */
  Belcika = 'BELCIKA',
  /** BULGARİSTAN */
  Bulgaristan = 'BULGARISTAN',
  /** ÇEK CUMHURİYETİ */
  CekCumhuriyeti = 'CEK_CUMHURIYETI',
  /** DANİMARKA */
  Danimarka = 'DANIMARKA',
  /** ESTONYA */
  Estonya = 'ESTONYA',
  /** FİNLANDİYA */
  Finlandiya = 'FINLANDIYA',
  /** FRANSA */
  Fransa = 'FRANSA',
  /** HIRVATİSTAN */
  Hirvatistan = 'HIRVATISTAN',
  /** HOLLANDA */
  Hollanda = 'HOLLANDA',
  /** İNGİLTERE */
  Ingiltere = 'INGILTERE',
  /** İSPANYA */
  Ispanya = 'ISPANYA',
  /** İSVEÇ */
  Isvec = 'ISVEC',
  /** İSVİÇRE */
  Isvicre = 'ISVICRE',
  /** İTALYA */
  Italya = 'ITALYA',
  /** İZLANDA */
  Izlanda = 'IZLANDA',
  /** LETONYA */
  Letonya = 'LETONYA',
  /** LİTVANYA */
  Litvanya = 'LITVANYA',
  /** LÜKSEMBURG */
  Luksemburg = 'LUKSEMBURG',
  /** MACARİSTAN */
  Macaristan = 'MACARISTAN',
  /** MALTA */
  Malta = 'MALTA',
  /** NORVEÇ */
  Norvec = 'NORVEC',
  /** POLONYA */
  Polonya = 'POLONYA',
  /** PORTEKİZ */
  Portekiz = 'PORTEKIZ',
  /** ROMANYA */
  Romanya = 'ROMANYA',
  /** SIRBİSTAN */
  Sirbistan = 'SIRBISTAN',
  /** SLOVAKYA */
  Slovakya = 'SLOVAKYA',
  /** SLOVENYA */
  Slovenya = 'SLOVENYA',
  /** YUNANİSTAN */
  Yunanistan = 'YUNANISTAN',
}
