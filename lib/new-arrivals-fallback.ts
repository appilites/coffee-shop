/** Shared fallback cards when Supabase is unavailable, query fails, or RLS returns no rows. */
export const FALLBACK_NEW_ARRIVALS = [
  {
    id: "fallback-1",
    title: "Protein Waffles",
    description: "Build your own protein-packed waffle with your favorite toppings",
    imageUrl: "/newarrival.jfif",
    buttonText: "Try Now",
    redirectLink: "/menu?category=cat-17",
    displayOrder: 1,
  },
  {
    id: "fallback-2",
    title: "Oat Milk Chai Tea Latte",
    description: "Slow sips, sweet moments. Protein-packed chai tea latte with oat milk",
    imageUrl: "/newarrival1.jfif",
    buttonText: "Try Now",
    redirectLink: "/menu?category=cat-16",
    displayOrder: 2,
  },
  {
    id: "fallback-3",
    title: "Specialty Drinks",
    description: "Explore our premium specialty drink collection with unique flavors",
    imageUrl: "/newarrival2.jfif",
    buttonText: "Try Now",
    redirectLink: "/menu?category=cat-specialty-drinks",
    displayOrder: 3,
  },
] as const
