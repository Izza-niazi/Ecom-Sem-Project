import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { useState, useEffect } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import MenuItem from '@mui/material/MenuItem';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { NEW_PRODUCT_RESET } from '../../constants/productConstants';
import { createProduct, clearErrors } from '../../actions/productAction';
import ImageIcon from '@mui/icons-material/Image';
import { categories } from '../../utils/constants';
import MetaData from '../Layouts/MetaData';
import { metaTitle } from '../../constants/brand';
import BackdropLoader from '../Layouts/BackdropLoader';
import { EMPTY_SEO_FIELDS } from '../../utils/seo';

const NewProduct = () => {

    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    const { loading, success, error } = useSelector((state) => state.newProduct);

    const [highlights, setHighlights] = useState([]);
    const [highlightInput, setHighlightInput] = useState("");
    const [specs, setSpecs] = useState([]);
    const [specsInput, setSpecsInput] = useState({
        title: "",
        description: ""
    });

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState(0);
    const [cuttedPrice, setCuttedPrice] = useState(0);
    const [category, setCategory] = useState("");
    const [stock, setStock] = useState(0);
    const [warranty, setWarranty] = useState(0);
    const [brand, setBrand] = useState("");
    const [images, setImages] = useState([]);
    const [imagesPreview, setImagesPreview] = useState([]);

    const [logo, setLogo] = useState("");
    const [logoPreview, setLogoPreview] = useState("");
    const [seo, setSeo] = useState(() => ({ ...EMPTY_SEO_FIELDS }));

    const handleSpecsChange = (e) => {
        setSpecsInput({ ...specsInput, [e.target.name]: e.target.value });
    }

    const addSpecs = () => {
        if (!specsInput.title.trim()) return;
        setSpecs([
            ...specs,
            { title: specsInput.title.trim(), description: (specsInput.description || '').trim() },
        ]);
        setSpecsInput({ title: "", description: "" });
    }

    const addHighlight = () => {
        if (!highlightInput.trim()) return;
        setHighlights([...highlights, highlightInput]);
        setHighlightInput("");
    }

    const deleteHighlight = (index) => {
        setHighlights(highlights.filter((h, i) => i !== index))
    }

    const deleteSpec = (index) => {
        setSpecs(specs.filter((s, i) => i !== index))
    }

    const handleLogoChange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            if (reader.readyState === 2) {
                setLogoPreview(reader.result);
                setLogo(reader.result);
            }
        };
        reader.readAsDataURL(file);
    }

    const handleProductImageChange = (e) => {
        const files = e.target.files ? Array.from(e.target.files) : [];
        if (files.length === 0) return;

        setImages([]);
        setImagesPreview([]);

        files.forEach((file) => {
            const reader = new FileReader();

            reader.onload = () => {
                if (reader.readyState === 2) {
                    setImagesPreview((oldImages) => [...oldImages, reader.result]);
                    setImages((oldImages) => [...oldImages, reader.result]);
                }
            }
            reader.readAsDataURL(file);
        });
    }

    const newProductSubmitHandler = (e) => {
        e.preventDefault();

        // required field checks
        if (highlights.length <= 0) {
            enqueueSnackbar("Add Highlights", { variant: "warning" });
            return;
        }
        if (!logo) {
            enqueueSnackbar("Add Brand Logo", { variant: "warning" });
            return;
        }
        if (specs.length <= 1) {
            enqueueSnackbar("Add Minimum 2 Specifications", { variant: "warning" });
            return;
        }
        if (images.length <= 0) {
            enqueueSnackbar("Add Product Images", { variant: "warning" });
            return;
        }

        const formData = new FormData();

        formData.set("name", name);
        formData.set("description", String(description ?? '').trim());
        formData.set("price", price);
        formData.set("cuttedPrice", cuttedPrice);
        formData.set("category", category);
        formData.set("stock", stock);
        formData.set("warranty", warranty);
        formData.set("brandname", brand);
        formData.set("logo", logo);

        images.forEach((image) => {
            formData.append("images", image);
        });

        highlights.forEach((h) => {
            formData.append("highlights", h);
        });

        specs.forEach((s) => {
            formData.append("specifications", JSON.stringify(s));
        });

        formData.set("seo", JSON.stringify(seo));

        dispatch(createProduct(formData));
    }

    useEffect(() => {
        if (error) {
            enqueueSnackbar(error, { variant: "error" });
            dispatch(clearErrors());
        }
        if (success) {
            enqueueSnackbar("Product Created", { variant: "success" });
            dispatch({ type: NEW_PRODUCT_RESET });
            navigate("/admin/products");
        }
    }, [dispatch, error, success, navigate, enqueueSnackbar]);

    return (
        <>
            <MetaData title={metaTitle('Admin: New Product')} />

            {loading && <BackdropLoader />}
            <form onSubmit={newProductSubmitHandler} encType="multipart/form-data" className="flex flex-col sm:flex-row bg-app-card rounded-lg shadow p-4" id="mainform">

                <div className="flex flex-col gap-3 m-2 sm:w-1/2">
                    <TextField
                        label="Name"
                        variant="outlined"
                        size="small"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <TextField
                        label="Description"
                        multiline
                        rows={3}
                        variant="outlined"
                        size="small"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        helperText="Optional — long-form copy for the product page"
                    />
                    <div className="flex justify-between">
                        <TextField
                            label="Price"
                            type="number"
                            variant="outlined"
                            size="small"
                            InputProps={{
                                inputProps: {
                                    min: 0
                                }
                            }}
                            required
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                        />
                        <TextField
                            label="Cutted Price"
                            type="number"
                            variant="outlined"
                            size="small"
                            InputProps={{
                                inputProps: {
                                    min: 0
                                }
                            }}
                            required
                            value={cuttedPrice}
                            onChange={(e) => setCuttedPrice(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-between gap-4">
                        <TextField
                            label="Category"
                            select
                            fullWidth
                            variant="outlined"
                            size="small"
                            required
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            {categories.map((el, i) => (
                                <MenuItem value={el} key={i}>
                                    {el}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label="Stock"
                            type="number"
                            variant="outlined"
                            size="small"
                            InputProps={{
                                inputProps: {
                                    min: 0
                                }
                            }}
                            required
                            value={stock}
                            onChange={(e) => setStock(e.target.value)}
                        />
                        <TextField
                            label="Warranty"
                            type="number"
                            variant="outlined"
                            size="small"
                            InputProps={{
                                inputProps: {
                                    min: 0
                                }
                            }}
                            required
                            value={warranty}
                            onChange={(e) => setWarranty(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-2 rounded-lg border border-app-border bg-black/15 p-3">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <h2 className="font-medium text-slate-100">Highlights</h2>
                            <span className="text-xs text-slate-400">{highlights.length} added</span>
                        </div>
                        <p className="text-xs leading-relaxed text-slate-400">
                            Short selling points shown as bullets on the product page (e.g. &quot;30h battery&quot;, &quot;1 year warranty&quot;). Add at least one.
                        </p>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                            <TextField
                                size="small"
                                fullWidth
                                placeholder="e.g. Free delivery"
                                value={highlightInput}
                                onChange={(e) => setHighlightInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addHighlight();
                                    }
                                }}
                            />
                            <Button type="button" variant="contained" size="small" onClick={addHighlight} sx={{ minWidth: 88 }}>
                                Add
                            </Button>
                        </div>
                        {highlights.length === 0 ? (
                            <p className="text-sm text-slate-500">No highlights yet — they will appear here after you add them.</p>
                        ) : (
                            <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
                                {highlights.map((h, i) => (
                                    <li
                                        key={`${i}-${h.slice(0, 24)}`}
                                        className="flex items-center justify-between gap-2 rounded-md border border-app-border bg-slate-900/50 px-3 py-2 text-sm text-slate-100"
                                    >
                                        <span className="min-w-0 break-words">{h}</span>
                                        <IconButton
                                            type="button"
                                            size="small"
                                            aria-label="Remove highlight"
                                            onClick={() => deleteHighlight(i)}
                                            className="shrink-0 text-red-400 hover:bg-red-500/10"
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <h2 className="font-medium">SEO (optional)</h2>
                    <p className="text-xs text-gray-500">
                        Search snippets and link previews. Leave blank to use the product name and description.
                    </p>
                    <TextField
                        label="Page title"
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={seo.pageTitle}
                        onChange={(e) => setSeo({ ...seo, pageTitle: e.target.value })}
                        helperText="Browser tab title (max ~70 chars)"
                    />
                    <TextField
                        label="Meta description"
                        multiline
                        rows={2}
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={seo.metaDescription}
                        onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })}
                        helperText="Shown in search results"
                    />
                    <TextField
                        label="Keywords"
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={seo.keywords}
                        onChange={(e) => setSeo({ ...seo, keywords: e.target.value })}
                        helperText="Comma-separated"
                    />
                    <TextField
                        label="Open Graph title"
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={seo.ogTitle}
                        onChange={(e) => setSeo({ ...seo, ogTitle: e.target.value })}
                    />
                    <TextField
                        label="Open Graph description"
                        multiline
                        rows={2}
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={seo.ogDescription}
                        onChange={(e) => setSeo({ ...seo, ogDescription: e.target.value })}
                    />
                    <TextField
                        label="Canonical path"
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={seo.canonicalPath}
                        onChange={(e) => setSeo({ ...seo, canonicalPath: e.target.value })}
                        helperText="Optional; defaults to this product URL when empty"
                    />
                    <TextField
                        label="Robots"
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={seo.robots}
                        onChange={(e) => setSeo({ ...seo, robots: e.target.value })}
                        helperText="Usually index, follow"
                    />

                    <h2 className="font-medium">Brand Details</h2>
                    <div className="flex justify-between gap-4 items-start">
                        <TextField
                            label="Brand"
                            type="text"
                            variant="outlined"
                            size="small"
                            required
                            value={brand}
                            onChange={(e) => setBrand(e.target.value)}
                        />
                        <div className="w-24 h-10 flex items-center justify-center border rounded-lg">
                            {!logoPreview ? <ImageIcon /> :
                                <img draggable="false" src={logoPreview} alt="Brand Logo" className="w-full h-full object-contain" />
                            }
                        </div>
                        <label className="rounded bg-gray-400 text-center cursor-pointer text-white py-2 px-2.5 shadow hover:shadow-lg">
                            <input
                                type="file"
                                name="logo"
                                accept="image/*"
                                onChange={handleLogoChange}
                                className="hidden"
                            />
                            Choose Logo
                        </label>
                    </div>

                </div>

                <div className="flex flex-col gap-2 m-2 sm:w-1/2">
                    <h2 className="font-medium">Specifications</h2>
                    <p className="text-xs text-slate-400">Add at least one row. Spec name is required; the value column is optional.</p>

                    <div className="flex flex-wrap justify-evenly gap-2 items-end">
                        <TextField value={specsInput.title} onChange={handleSpecsChange} name="title" label="Spec name" placeholder="e.g. Display" variant="outlined" size="small" />
                        <TextField value={specsInput.description} onChange={handleSpecsChange} name="description" label="Value (optional)" placeholder='e.g. 6.5" FHD+' variant="outlined" size="small" />
                        <Button type="button" variant="contained" size="small" onClick={addSpecs} sx={{ minWidth: 72 }}>
                            Add
                        </Button>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        {specs.map((spec, i) => (
                            <div key={i} className="flex items-center justify-between gap-2 rounded-md border border-app-border bg-slate-900/50 py-2 px-3 text-sm text-slate-100">
                                <div className="min-w-0 flex-1">
                                    <p className="font-medium text-slate-200">{spec.title}</p>
                                    {spec.description ? <p className="text-slate-400">{spec.description}</p> : null}
                                </div>
                                <IconButton type="button" size="small" aria-label="Remove specification" onClick={() => deleteSpec(i)} className="shrink-0 text-red-400 hover:bg-red-500/10">
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </div>
                        ))}
                    </div>

                    <h2 className="font-medium">Product Images</h2>
                    <div className="flex gap-2 overflow-x-auto h-32 border rounded">
                        {imagesPreview.map((image, i) => (
                            <img draggable="false" src={image} alt="Product" key={i} className="w-full h-full object-contain" />
                        ))}
                    </div>
                    <label className="rounded font-medium bg-gray-400 text-center cursor-pointer text-white p-2 shadow hover:shadow-lg my-2">
                        <input
                            type="file"
                            name="images"
                            accept="image/*"
                            multiple
                            onChange={handleProductImageChange}
                            className="hidden"
                        />
                        Choose Files
                    </label>

                    <div className="flex justify-end">
                        <input form="mainform" type="submit" className="bg-primary-orange uppercase w-1/3 p-3 text-white font-medium rounded shadow hover:shadow-lg cursor-pointer" value="Submit" />
                    </div>

                </div>

            </form>
        </>
    );
};

export default NewProduct;
