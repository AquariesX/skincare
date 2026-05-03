# Recommendation service — fetches from DB, falls back to defaults if DB empty.

# Condition label → skin type name mapping (matches CLASS_LABELS in model_service.py)
CONDITION_SKIN_TYPE_MAP = {
    'acne': 'Acne',
    'dark_spots': 'Dark Spots',
    'normal_skin': 'Normal Skin',
    'puffy_eyes': 'Puffy Eyes',
    'wrinkles': 'Wrinkles',
}

# Default recommendations used only when DB has no data yet.
_DEFAULTS = {
    'acne': {
        'display_name': 'Acne',
        'description': 'Acne is caused by clogged pores, excess sebum, and bacteria.',
        'skincare_routine': 'Gentle foaming cleanser → Salicylic acid toner → Benzoyl peroxide spot treatment → Oil-free moisturizer → SPF 30 sunscreen',
        'medicines': 'Benzoyl Peroxide 2.5%, Salicylic Acid 2%, Clindamycin (prescription)',
        'ointments': 'Adapalene gel, Tretinoin (prescription), Erythromycin topical',
        'serums': 'Niacinamide 10% serum, Salicylic acid serum, Tea tree oil serum',
        'home_remedies': 'Apply diluted tea tree oil. Use honey mask. Apply aloe vera gel. Cold compress to reduce swelling. Turmeric and yogurt mask.',
        'precautions': 'Do not pop pimples. Change pillowcases every 2-3 days. Avoid touching face. Use non-comedogenic products. Stay hydrated.',
        'dermatologist_advice': 'Consult a dermatologist if acne is severe, cystic, causing scarring, or not improving after 8 weeks of treatment.',
    },
    'dark_spots': {
        'display_name': 'Dark Spots (Hyperpigmentation)',
        'description': 'Dark spots result from excess melanin production due to sun damage, acne scars, or hormonal changes.',
        'skincare_routine': 'Gentle cleanser → Vitamin C serum (AM) → Niacinamide serum → Brightening moisturizer → SPF 50 sunscreen (AM)',
        'medicines': 'Hydroquinone cream (prescription), Kojic acid cream, Azelaic acid',
        'ointments': 'Alpha arbutin cream, Tretinoin cream (prescription), Glycolic acid peel',
        'serums': 'Vitamin C 15% serum, Niacinamide 10% serum, Alpha Arbutin 2% serum',
        'home_remedies': 'Lemon juice + honey mask (diluted). Turmeric paste. Aloe vera. Potato slice. Green tea extract.',
        'precautions': 'Wear SPF 50+ every day. Avoid peak sun hours 10am-4pm. Do not pick at dark spots. Results take 4-12 weeks.',
        'dermatologist_advice': 'See a dermatologist for prescription-strength hydroquinone, chemical peels, or laser treatment for stubborn hyperpigmentation.',
    },
    'normal_skin': {
        'display_name': 'Normal / Healthy Skin',
        'description': 'Your skin appears healthy and balanced. Maintain your routine and focus on prevention.',
        'skincare_routine': 'Gentle daily cleanser → Vitamin C serum (AM) → Hyaluronic acid serum → Moisturizer → SPF 30 sunscreen (AM) → Retinol (PM)',
        'medicines': 'No specific medication needed for healthy skin.',
        'ointments': 'Preventive retinol cream, Antioxidant cream',
        'serums': 'Hyaluronic acid serum, Vitamin C + E serum, Peptide serum',
        'home_remedies': 'Honey face mask. Oatmeal scrub. Rose water toner. Cucumber slices. Aloe vera gel.',
        'precautions': 'Always wear SPF. Stay hydrated. Get 7-9 hours sleep. Eat antioxidant-rich foods. Avoid smoking.',
        'dermatologist_advice': 'Annual skin check recommended. Consult if new moles, unusual spots, or texture changes appear.',
    },
    'puffy_eyes': {
        'display_name': 'Puffy Eyes',
        'description': 'Puffy eyes are caused by fluid retention, allergies, lack of sleep, or stress.',
        'skincare_routine': 'Eye makeup remover → Gentle eye cleanser → Caffeine eye serum → Eye cream with peptides → Sunscreen near eye area',
        'medicines': 'Antihistamines for allergy-related puffiness (consult doctor). Cold compresses.',
        'ointments': 'Vitamin K cream, Retinol eye cream, Peptide-based eye cream',
        'serums': 'Caffeine eye serum, Vitamin C eye serum, Hyaluronic acid eye serum',
        'home_remedies': 'Cold green tea bags on eyes. Chilled cucumber slices. Cold spoons. Elevate head while sleeping. Cold compress.',
        'precautions': 'Get 7-9 hours sleep. Reduce salt intake. Stay hydrated. Avoid alcohol. Manage allergies.',
        'dermatologist_advice': 'See a dermatologist or ophthalmologist if puffiness is severe, persistent, or accompanied by pain, redness, or vision changes.',
    },
    'wrinkles': {
        'display_name': 'Wrinkles / Fine Lines',
        'description': 'Wrinkles are caused by aging, sun damage, repetitive facial movements, and loss of collagen.',
        'skincare_routine': 'Gentle cleanser → Vitamin C serum (AM) → Peptide serum → SPF 30 day cream → Retinol (PM) → Hyaluronic acid (PM) → Night cream',
        'medicines': 'Tretinoin (prescription retinoid), Tazarotene (prescription)',
        'ointments': 'Retinol 0.3-1% cream, Peptide anti-aging cream, Ceramide repair cream',
        'serums': 'Retinol serum (PM), Vitamin C firming serum (AM), Hyaluronic acid serum, Collagen-boosting peptide serum',
        'home_remedies': 'Egg white face mask. Coconut oil massage. Aloe vera gel. Rosehip seed oil. Honey + olive oil mask.',
        'precautions': 'Wear SPF 30+ every day. Avoid smoking. Sleep on back to prevent sleep lines. Stay hydrated. Eat collagen-rich foods.',
        'dermatologist_advice': 'Consider consulting a dermatologist for retinoid prescription, Botox, fillers, chemical peels, or microneedling for deeper wrinkles.',
    },
}


def get_recommendation_for_condition(condition):
    """
    Returns (rec_dict, skin_type_obj, rec_obj).
    Tries DB first; falls back to defaults.
    """
    from ..models import SkinType, Recommendation

    skin_type_name = CONDITION_SKIN_TYPE_MAP.get(condition, 'Normal Skin')

    skin_type = SkinType.query.filter(
        SkinType.name.ilike(skin_type_name)
    ).first()

    if skin_type:
        rec_obj = Recommendation.query.filter_by(skin_type_id=skin_type.id).first()
        if rec_obj:
            return rec_obj.to_dict(), skin_type, rec_obj

    # Fallback to defaults
    defaults = _DEFAULTS.get(condition, _DEFAULTS['normal_skin'])
    return {
        **defaults,
        'skin_type_id': skin_type.id if skin_type else None,
        'id': None,
    }, skin_type, None


# Keep legacy function name for any references
def get_recommendations(condition):
    rec_dict, _, _ = get_recommendation_for_condition(condition)
    return rec_dict
