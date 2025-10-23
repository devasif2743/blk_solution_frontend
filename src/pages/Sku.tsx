import React, { useMemo, useState } from "react";

type Category = { id: string; label: string };

const SAMPLE_CATEGORIES: Category[] = [
  { id: "cat-1", label: "Beverages" },
  { id: "cat-2", label: "Snacks" },
  { id: "cat-3", label: "Dairy" },
];

const formatAria = (name: string, required?: boolean) =>
  `${name}${required ? " (required)" : ""}`;

const Sku: React.FC = () => {
  const [category, setCategory] = useState<string>("");
  const [itemName, setItemName] = useState<string>("");
  const [touched, setTouched] = useState<{ category?: boolean; itemName?: boolean }>({});
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [resultsPresent, setResultsPresent] = useState<boolean>(false);

  const errors = useMemo(() => {
    const e: { category?: string; itemName?: string } = {};
    if (!category) e.category = "Category is required";
    if (itemName && itemName.trim().length > 0 && itemName.trim().length < 2)
      e.itemName = "Item name must be at least 2 characters";
    return e;
  }, [category, itemName]);

  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors]);

  const handleSubmit = async (ev?: React.FormEvent) => {
    ev?.preventDefault();
    setTouched({ category: true, itemName: true });

    if (!isValid) return;

    setIsSearching(true);
    setResultsPresent(false);

    // Replace this simulated request with your API call.
    try {
      await new Promise((res) => setTimeout(res, 600));
      // For demo keep results empty (as screenshot). To show results set to true.
      setResultsPresent(false);
    } catch {
      // handle error with toaster or Sonner in your app
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="p-4 lg:p-6">
      {/* Header / breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">SKU</h1>
          <div className="text-sm text-slate-500 mt-1">
            <a href="/" className="text-sky-500 hover:underline">
              Home
            </a>{" "}
            <span className="mx-2"> - </span> SKU
          </div>
        </div>
      </div>

      {/* Search form area */}
      <section className="bg-[#f5f6fa] p-6 rounded-md mb-6">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-end"
          noValidate
        >
          {/* Category - left column (3/12) */}
          <div className="lg:col-span-3">
            <label htmlFor="sku-category" className="block text-sm font-medium text-slate-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>

            <select
              id="sku-category"
              aria-label={formatAria("Category", true)}
              aria-invalid={!!(touched.category && errors.category)}
              aria-describedby={touched.category && errors.category ? "sku-category-error" : undefined}
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setTouched((s) => ({ ...s, category: true }));
              }}
              onBlur={() => setTouched((s) => ({ ...s, category: true }))}
              className={`w-full h-11 px-3 py-2 rounded border transition focus:outline-none focus:ring-2 focus:ring-sky-300 ${
                touched.category && errors.category ? "border-red-300" : "border-slate-200"
              } bg-white`}
            >
              <option value="">Select category</option>
              {SAMPLE_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>

            {touched.category && errors.category && (
              <p id="sku-category-error" className="mt-1 text-sm text-red-600">
                {errors.category}
              </p>
            )}
          </div>

          {/* Item Name - middle column (6/12) */}
          <div className="lg:col-span-6">
            <label htmlFor="sku-item" className="block text-sm font-medium text-slate-700 mb-2">
              Item Name
            </label>
            <input
              id="sku-item"
              aria-label={formatAria("Item Name")}
              aria-invalid={!!(touched.itemName && errors.itemName)}
              aria-describedby={touched.itemName && errors.itemName ? "sku-item-error" : undefined}
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              onBlur={() => setTouched((s) => ({ ...s, itemName: true }))}
              placeholder="Item Name"
              className={`w-full h-11 px-3 py-2 rounded border transition focus:outline-none focus:ring-2 focus:ring-sky-300 ${
                touched.itemName && errors.itemName ? "border-red-300" : "border-slate-200"
              } bg-white`}
            />
            {touched.itemName && errors.itemName && (
              <p id="sku-item-error" className="mt-1 text-sm text-red-600">
                {errors.itemName}
              </p>
            )}
          </div>

          {/* Search button - right column (3/12) */}
          <div className="lg:col-span-3 flex justify-start lg:justify-end">
            <button
              type="submit"
              disabled={isSearching || !category}
              className={`inline-flex items-center justify-center px-6 py-2 h-11 rounded shadow text-white font-semibold transition focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                isSearching || !category
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-700 hover:bg-indigo-800"
              }`}
              aria-disabled={isSearching || !category}
              title={!category ? "Please select a category" : "Search SKUs"}
            >
              {isSearching ? "Searching..." : "SEARCH"}
            </button>
          </div>
        </form>
      </section>

      {/* Results area */}
      <section className="bg-white rounded-lg shadow p-6 min-h-[420px]">
        {!resultsPresent ? (
          <div className="h-[420px] flex flex-col items-center justify-center text-slate-400">
            <p className="text-lg font-medium">No results</p>
            <p className="text-sm mt-1">Select a category and click SEARCH to view SKUs</p>
          </div>
        ) : (
          <div>
            {/* Replace with your results table / grid */}
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="text-sm text-slate-700">
                  <tr>
                    <th className="px-3 py-2">#</th>
                    <th className="px-3 py-2">SKU</th>
                    <th className="px-3 py-2">Item</th>
                    <th className="px-3 py-2">Category</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>{/* rows */}</tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Sku;
