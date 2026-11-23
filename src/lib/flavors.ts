export type Flavor = {
  id: string;
  name: string;
  chinese: string;
  season: string;
  seasonChar: string;
  ingredients: string;
  texture: string;
  thumb: string;
  background: string;
  accent: string;
  /** Announced but not on sale yet. */
  comingSoon?: boolean;
};

export const flavors: Flavor[] = [
  {
    id: "jasmine-green",
    name: "Jasmine Green Tea",
    chinese: "茉莉花茶",
    season: "spring",
    seasonChar: "春",
    ingredients: "Green tea, jasmine",
    texture: "/textures/jasmine-green.jpg",
    thumb: "/thumbs/jasmine-green.jpg",
    background: "#d4ebf5",
    accent: "#3fa7a8",
  },
  {
    id: "peach-oolong",
    name: "Peach Oolong Tea",
    chinese: "蜜桃烏龍茶",
    season: "summer",
    seasonChar: "夏",
    ingredients: "Oolong tea, peach flavouring",
    texture: "/textures/peach-oolong.jpg",
    thumb: "/thumbs/peach-oolong.jpg",
    background: "#f8dbe1",
    accent: "#d9667f",
  },
  {
    id: "lemon-green",
    name: "Lemon Green Tea",
    chinese: "檸檬綠茶",
    season: "summer",
    seasonChar: "夏",
    ingredients: "Green tea, lemon peel, lemon flavouring",
    texture: "/textures/lemon-green.jpg",
    thumb: "/thumbs/lemon-green.jpg",
    background: "#e1eecf",
    accent: "#6f9f3f",
  },
  {
    id: "lychee-black",
    name: "Lychee Black Tea",
    chinese: "荔枝紅茶",
    season: "autumn",
    seasonChar: "秋",
    ingredients: "Black tea, lychee flavouring",
    texture: "/textures/lychee-black.jpg",
    thumb: "/thumbs/lychee-black.jpg",
    background: "#f8d2b8",
    accent: "#d45f2c",
  },
  {
    id: "chrysanthemum-puer",
    name: "Chrysanthemum Pu'er Tea",
    chinese: "菊花普洱茶",
    season: "winter",
    seasonChar: "冬",
    ingredients: "Pu'er tea, chrysanthemum",
    texture: "/textures/chrysanthemum-puer.jpg",
    thumb: "/thumbs/chrysanthemum-puer.jpg",
    background: "#f6edc4",
    accent: "#c08a12",
  },
  {
    id: "red-date-wolfberry",
    name: "Red Date Wolfberry Tea",
    chinese: "紅棗枸杞茶",
    season: "winter",
    seasonChar: "冬",
    ingredients: "Wolfberry, red date",
    texture: "/textures/red-date-wolfberry.jpg",
    thumb: "/thumbs/red-date-wolfberry.jpg",
    background: "#f5d6d0",
    accent: "#b3261e",
    comingSoon: true,
  },
];
