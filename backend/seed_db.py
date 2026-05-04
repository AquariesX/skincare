"""
Database seeder — run once after creating tables:
    python seed_db.py

Creates:
  - 5 skin types (matching model CLASS_LABELS)
  - 5 recommendations (one per skin type)
  - 1 admin user  (admin@gmail.com / admin123)
"""

from app import create_app
from app.extensions import db
from app.models import User, SkinType, Recommendation

SKIN_DATA = [
    {
        'name': 'Acne',
        'description': 'Skin condition caused by clogged pores, excess sebum, and bacteria.',
        'rec': {
            'description': 'Acne is caused by clogged pores, excess sebum production, and bacterial growth. It can appear as pimples, blackheads, whiteheads, or cysts.',
            'skincare_routine': 'Morning: Gentle foaming cleanser → Salicylic acid toner → Niacinamide serum → Oil-free moisturizer → SPF 30 sunscreen\nEvening: Gentle cleanser → Benzoyl peroxide spot treatment → Lightweight moisturizer',
            'medicines': 'Benzoyl Peroxide 2.5-5%, Salicylic Acid 2%, Adapalene 0.1% (OTC), Clindamycin topical (prescription), Doxycycline (prescription for severe cases)',
            'ointments': 'Adapalene gel (Differin), Tretinoin cream (prescription), Erythromycin topical, Clindamycin phosphate gel',
            'serums': 'Niacinamide 10% serum, Salicylic acid 2% serum, Tea tree oil serum (diluted 5%), Azelaic acid 10% serum',
            'home_remedies': 'Apply diluted tea tree oil (5%) to affected areas\nHoney and cinnamon face mask (antibacterial)\nAloe vera gel to reduce inflammation\nCold compress on pimples for 5-10 minutes\nTurmeric and yogurt mask (2x per week)\nChange pillowcases every 2-3 days',
            'precautions': 'Do not pop, squeeze, or pick at pimples — causes scarring\nAvoid touching your face throughout the day\nUse only non-comedogenic (oil-free) products\nChange pillowcases every 2-3 days\nStay hydrated (8 glasses of water daily)\nManage stress through exercise and sleep\nAvoid dairy and high-glycemic foods if sensitive',
            'dermatologist_advice': 'Consult a dermatologist if: acne is severe or cystic, causing deep scars, spreading rapidly, not improving after 8 weeks of consistent treatment, accompanied by hormonal changes, or significantly affecting your quality of life.',
        }
    },
    {
        'name': 'Dark Spots',
        'description': 'Excess melanin production causing hyperpigmentation from sun damage, acne scars, or hormonal changes.',
        'rec': {
            'description': 'Dark spots (hyperpigmentation) result from excess melanin production triggered by sun exposure, post-acne marks, hormonal changes (melasma), or skin injuries.',
            'skincare_routine': 'Morning: Gentle cleanser → Vitamin C 15% serum → Niacinamide 10% serum → Moisturizer → SPF 50 sunscreen (ESSENTIAL)\nEvening: Gentle cleanser → Alpha Arbutin serum → Retinol 0.3% (2-3x/week) → Moisturizer',
            'medicines': 'Hydroquinone 2-4% (prescription), Kojic acid cream 1-2%, Azelaic acid 15-20%, Tranexamic acid topical',
            'ointments': 'Tretinoin cream 0.025-0.05% (prescription), Glycolic acid 10% cream, Alpha Arbutin 2% cream',
            'serums': 'Vitamin C 15-20% serum (L-Ascorbic acid), Niacinamide 10% serum, Alpha Arbutin 2% serum, Kojic Acid serum, Tranexamic Acid 5% serum',
            'home_remedies': 'Diluted lemon juice + honey mask (10 minutes, rinse well)\nTurmeric + milk paste (anti-inflammatory)\nAloe vera gel daily application\nGreen tea extract as toner\nPapaya enzyme mask (contains papain)\nRaw potato slice on spots (azelaic acid precursor)',
            'precautions': 'Wear SPF 50+ EVERY DAY — even indoors, even in winter\nAvoid sun exposure 10am-4pm; wear hats and protective clothing\nDo not pick or scratch dark spots\nResults take 4-12 weeks — be patient and consistent\nPatch test all new brightening products\nAvoid harsh physical scrubs on hyperpigmented areas',
            'dermatologist_advice': 'See a dermatologist for: stubborn spots not responding to OTC treatments after 12 weeks, prescription-strength hydroquinone, professional chemical peels (glycolic/TCA), laser treatment (IPL, Nd:YAG), or melasma requiring hormonal evaluation.',
        }
    },
    {
        'name': 'Normal Skin',
        'description': 'Healthy, balanced skin with no significant visible conditions.',
        'rec': {
            'description': 'Your skin appears healthy and well-balanced with no significant concerns. Focus on maintaining this with a consistent preventive routine.',
            'skincare_routine': 'Morning: Gentle cleanser → Vitamin C serum → Hyaluronic acid serum → Moisturizer with SPF 30\nEvening: Gentle cleanser → Retinol serum (2-3x/week) → Peptide serum → Nourishing night cream',
            'medicines': 'No specific medications needed for healthy skin.',
            'ointments': 'Preventive retinol cream (0.1-0.3%), Peptide-rich moisturizer',
            'serums': 'Vitamin C + E + Ferulic acid serum, Hyaluronic acid serum, Peptide serum, Niacinamide 5% serum',
            'home_remedies': 'Honey face mask (natural humectant and antibacterial)\nOatmeal + yogurt soothing mask\nRose water facial mist (toner)\nCucumber slices for cooling and hydration\nAloe vera gel as lightweight moisturizer\nGreen tea ice cubes as anti-aging toner',
            'precautions': 'Always apply SPF 30+ every morning — UV damage is cumulative\nStay hydrated: 8 glasses of water daily\nGet 7-9 hours of quality sleep\nEat antioxidant-rich foods (berries, green vegetables, nuts)\nAvoid smoking and excessive alcohol\nDo not over-complicate your routine — less is more',
            'dermatologist_advice': 'Schedule an annual skin check with a dermatologist. Consult immediately if you notice new or changing moles, unusual spots, sudden texture changes, persistent redness, or any skin changes that concern you.',
        }
    },
    {
        'name': 'Puffy Eyes',
        'description': 'Fluid retention, allergies, lack of sleep, or stress causing swelling around the eyes.',
        'rec': {
            'description': 'Puffy eyes are caused by fluid retention under the thin, delicate skin around the eyes — triggered by sleep deprivation, allergies, high salt intake, alcohol, crying, or aging.',
            'skincare_routine': 'Morning: Gentle eye makeup remover → Eye cleanser → Caffeine eye serum → Peptide eye cream → Sunscreen (around eye area)\nEvening: Eye makeup remover → Retinol eye cream (alternate nights) → Hyaluronic acid eye serum → Eye cream',
            'medicines': 'Antihistamines for allergy-related puffiness (consult doctor), Caffeine-based eye drops (OTC), Vitamin K cream topically',
            'ointments': 'Vitamin K cream, Retinol eye cream 0.025%, Arnica gel (for bruising)',
            'serums': 'Caffeine 5% eye serum, Vitamin C eye serum, Peptide complex eye serum, Hyaluronic acid eye serum',
            'home_remedies': 'Cold green tea bags on closed eyes (10-15 minutes)\nChilled cucumber slices or spoons\nElevate head with extra pillow while sleeping\nCold compress with cloth soaked in cold water\nMassage gently in circular motions to drain fluid\nReduce sodium (salt) intake the evening before',
            'precautions': 'Get 7-9 hours of quality sleep every night\nElevate your head while sleeping to prevent fluid pooling\nReduce salt intake — sodium causes water retention\nStay hydrated to flush excess fluid\nLimit alcohol — it dehydrates and causes puffiness\nManage allergies with antihistamines if needed\nRemove makeup gently — never rub or pull eye area',
            'dermatologist_advice': 'Consult a dermatologist or ophthalmologist if: puffiness is severe and persistent, accompanied by pain, redness, or itching, associated with vision changes, caused by an allergic reaction, or you suspect an underlying condition like thyroid disease or kidney problems.',
        }
    },
    {
        'name': 'Wrinkles',
        'description': 'Fine lines and wrinkles caused by aging, sun damage, and loss of collagen.',
        'rec': {
            'description': 'Wrinkles and fine lines result from the natural aging process — loss of collagen and elastin — accelerated by sun exposure, smoking, repetitive facial movements, and dehydration.',
            'skincare_routine': 'Morning: Gentle creamy cleanser → Vitamin C serum → Peptide serum → SPF 30-50 day cream\nEvening: Oil cleanser → Gentle cleanser (double cleanse) → Retinol serum (3-4x/week) → Hyaluronic acid serum → Rich night cream',
            'medicines': 'Tretinoin 0.025-0.1% (prescription gold standard), Tazarotene cream (prescription), Topical Vitamin A derivatives',
            'ointments': 'Retinol 0.3-1% cream (OTC), Retinaldehyde cream, Peptide complex cream, Ceramide repair cream, Collagen-stimulating cream',
            'serums': 'Retinol serum (start 0.1%, increase gradually), Vitamin C 15-20% brightening serum, Hyaluronic acid multi-weight serum, Collagen-boosting peptide serum (Argireline, Matrixyl), Bakuchiol serum (retinol alternative)',
            'home_remedies': 'Egg white face mask (temporary skin tightening)\nCoconut oil massage at night (antioxidant properties)\nAloe vera gel daily — stimulates collagen production\nRosehip seed oil (natural retinol, Vitamin C)\nHoney + olive oil overnight mask\nFacial massage with gua sha or roller',
            'precautions': 'Wear SPF 30-50 EVERY SINGLE DAY — UV is the #1 cause of premature aging\nAvoid smoking — it destroys collagen significantly faster\nSleep on your back to prevent sleep lines and pillow creases\nStay well hydrated — plump skin shows fewer lines\nEat collagen-rich foods: bone broth, fish, citrus, eggs\nStart retinol slowly (1-2x/week) to avoid irritation\nAlways use rich moisturizer with retinol',
            'dermatologist_advice': 'Consult a dermatologist for: prescription tretinoin (significantly more effective than OTC retinol), Botox for dynamic wrinkles, dermal fillers (hyaluronic acid) for deep lines, chemical peels (TCA, glycolic), microneedling with PRP, laser resurfacing (CO2, Erbium), or radio-frequency skin tightening.',
        }
    },
]


def seed():
    app = create_app()
    with app.app_context():
        # Admin user
        if not User.query.filter_by(email='admin@gmail.com').first():
            admin = User()
            admin.username='Admin', 
            admin.email='admin@gmail.com', 
            admin.role='admin'
            admin.set_password('admin123')
            db.session.add(admin)
            db.session.commit()
            print('[Seed] Admin user created: admin@gmail.com / admin123')
        else:
            print('[Seed] Admin user already exists.')

        # Skin types + recommendations
        admin = User.query.filter_by(email='admin@gmail.com').first()
        for item in SKIN_DATA:
            st = SkinType.query.filter_by(name=item['name']).first()
            if not st:
                st = SkinType()
                st.name=item['name'], 
                st.description=item['description']
                db.session.add(st)
                db.session.commit()
                print(f'[Seed] SkinType created: {item["name"]}')
            else:
                print(f'[Seed] SkinType exists: {item["name"]}')

            rec = Recommendation.query.filter_by(skin_type_id=st.id).first()
            if not rec:
                rec = Recommendation()
                rec.skin_type_id=st.id, item['rec']
                db.session.add(rec)
                db.session.commit()
                print(f'[Seed] Recommendation created for: {item["name"]}')
            else:
                print(f'[Seed] Recommendation exists for: {item["name"]}')

        print('\n✅ Database seeded successfully!')
        print('   Admin login: admin@gmail.com / admin123')
        print('   Change the password after first login.')


if __name__ == '__main__':
    seed()
