import { storage } from "./storage";

const TERMS_SECTION_1_EN = `In Case of accident will occur to the vehicle and the mistake from the hirer the hirer has to pay basic lump sum of Dhs. __________ in addition to the daily rent till the vehicle complete repairing

In case of any accident will occur to the vehicle and the mistake not from the hirer will pay daily rent, till the vehicle complete repairing.

In case monthly rent the hirer should pay amount from every 10 days in advance

PER DAY 300 KMS AND 50 FILS EXTRA FOR ONE K.M.

Monthly maximum 5000 km is allowed, 40 fils extra charged for each km

If any renter repaired the car by himself (incase of accident or other damage) will find Dhs. 5000/-

If no previous arrangement has been made for the weekly / monthly rates then the hirer is liable to pay daily rate`;

const TERMS_SECTION_1_AR = `في حالة حدوث حادث وكان المستأجر منضرر بالدفع لإيجار فترة وقوف السيارة في الكراج لحين اصلاحها

في حالة الإيجار الشهري يقوم المستأجر بدفع الإيجار كل ١٠ أيام

عدد الكيلومترات المسموح بها (٣٠٠ كم) لليوم الواحد ومابزيد عن ذلك تحتسب ٥٠ إضافية لكيلومتر الواحد

الحد الأقصى للشهري المسموح به هو ٥٠٠٠ كم و٤٠ فلس إضافية على كل كيلومتر

فى حالة تصليح السيارة قبل اصلاح المستأجر غير الاصلاح غرامة على المستأجر قدرها (وستجرهم) تكون موزعه للشركة

اذاله يكن هناك اتفاق مسبق للإيجار الأسبوعي أو الشهري فسوف يحتسب بوافع السعر اليومى`;

const TERMS_SECTION_2_EN = `1. Hirer or Guarantor should follow and execute all the terms and conditions mentioned in this contract.
2. Motor means car or whatever is hired together with its accessories
3. In case of accident from hirer side he must pay full accident value with 2500 Dhs. plus daily rent for all days which a car in garage for repairing.
4. Hire charges should be paid in advance unless there is previous agreement.
5. Vehicle should be delivered to the hirer in a good condition according to the attached check out list and the hirer undertakes to keep sufficient water & Oil in the vehicle.
6. The Hirer has to return the vehicle to the office for the periodical services
7. The quantity of fuel & oil at the end of hire should be same with quantity when the hirer received the vehicle.
8. The Hirer shall in case of total loss of the car, pay the cost of insurance policy and any amount that the insurance company shall discount according to its conditions plus the daily time rate for the day spent at court if any.
9. In case of any mechanical damage that occurs to the vehicle, Hirer should stop the vehicle & inform the office directly.
10. Hirer is responsible to pay fine if he repairs the vehicle without a written permission from the office.
11. Hirer should return back the vehicle before 9pm. Any delay the office will take payment for full day hire.
12. Hirer is responsible about any complaint case or any obligations regarding the vehicle before the office or the official authorities, which occurs within the hire period. Also he will alone be responsible if he uses the vehicle to transport any forbidden items that are considered as illegal as per any of the Country's law. Hirer also should pay the full amount to the contract until some arrangement is reached between hirer and the office.
13. Hirer should return back the vehicle at the end of hiring period mentioned in the contract unless the vehicle should be in good condition as it was in the beginning and after checking with and obtaining the approval of MARMAR RENT A CAR to renew the hire period, otherwise each delay in day of hire will be accounted as double at the day hire value mentioned in the contract.
14. MARMAR RENT A CAR has the right to take the proper procedure against the hirer if he did not obey or execute the contract conditions.
15. Hirer is responsible for all damages and repairs that occur to the vehicle within the hire period and he will pay the full amount of the contract until repairing the damages
16. One day hire means 24 hours and any extra will be calculated as full day's hire
17. The vehicle is for use in U.A.E. only. The insurance coverage is also for U.A.E. only.
18. The hirer undertakes not to stick color or paper on the vehicle glass or any other stickers on the vehicle's "body" otherwise hirer should pay a compensation of Dhs. to MARMAR RENT A CAR and will alone bear the full responsibility in front of the concerned authorities.
19. Hirer should inform the police and MARMAR RENT A CAR immediately if any accident occurs to the vehicle, otherwise hirer will also alone bear the full responsibility in front of the concerned authorities.
20. The hirer is less than 25 years old and responsible for the vehicle damages he/she should pay 20% from the amount of repairing.
21. The hirer is allowed to drive 300 kms per day, for anything above 300 kms there is a charge of 50 fils per km.
22. If no previous arrangement has been made for weekly, monthly rates then the hirer is liable to pay the daily rate.
23. Third party insurance only.
24. In case of accident caused by the hirer, he will pay Dhs. 2500/- for his responsibility.
25. It is strictly prohibited the smoking inside the vehicle. If so the hirer will be charged AED 200/- as penalty.
26. VAT 5% will be charged`;

const TERMS_SECTION_2_AR = `١. المحترل يجب تركيته إليه دون النظر إلى الجسم أو القول
٢. يلتزم المستأجر أو الكفيل بتنفيذ كافة البنود التالية
٣. في حالة حصول حادث وكان المستأجر يحمل رخصة قيادة ماضي على صدورها أقل من سنة وهو المسبب في الحادث يتحمل ٪٢٠ من قيمة الحادث وإضافة إلى التحمل البالغ ٢٥٠٠ درهم، والإيجار اليومي لعدد أيام وقوف السيارة في الكراج لغرض التصليح
٤. إذا وقع حادث والسائق تحت تأثير المشروبات الروحية أو أي مسكر آخر يترتب عليه دفع تعويض كامل عن كافة الأضرار التي تصيب السيارة بالإضافة لأجرة السيارة أثناء التصليح
٥. سلمت المركبة للمستأجر بحالة جيدة حسب ما موضح في الرسم التخطيطي وتتعهد بملئها بالماء والزيت الضروري
٦. على المستأجر إعادة المركبة للتأجير للخدمات الدورية
٧. عند إعادة المركبة للمكتب يجب أن تكون الزيت والمحروقات كما كانت عليه عند التسليم
٨. في حال سقوط السيارة يتحمل المستأجر قيمة بوليصة التأمين مع أي مبلغ تقوم الشركة بخصمه بناء على شروط التأمين ويحتسب الإيجار على المستأجر حتى انتهاء القضية
٩. في حالة نزع الورقة اللاصقة الموجودة بالسيارة باسم الشركة يتحمل المستأجر ثلاثين درهم
١٠. في حالة حدوث أي عطل فني للمركبة على المستأجر أن يقوم بإبلاغ مكتب مرمر لاتخاذ الإجراءات المناسبة وليس له الحق في السير بها ويتحمل كافة الأضرار الناجمة عن ذلك
١١. ينبغي توظيف عودة المركبة قبل الساعة ٩ مساء وأي تأخير المكتب سوف يستغرق يوم كامل من المستأجر
١٢. يتحمل المستأجر أن يشترك المركبة في أي سباق للمركبات وخلاف ذلك يتحمل المسؤولية
١٣. المستأجر مسؤول مسؤولية كاملة عن أي شكاوى أو قضية أو التزامات أخرى تتعلق باستخدام المركبة أو ما تقع عليه أو ممنوعات بعد انتهاء الفترة المحددة للتأجير يجب عليه تحمل كافة المسؤوليات الناجمة عن ذلك أمام الجهات الرسمية ويلتزم المستأجر بتحمل سريان عقد الإيجار لغاية الانتهاء من تسوية الأمور بينه وبين المكتب من جميع النواحي
١٤. يلتزم المستأجر بإرجاع المركبة عند انتهاء مدة الإيجار المذكورة في العقد، على أن تكون في حالة جيدة كما استلمها. كما يجوز للمستأجر تجديد عقد الإيجار بعد أن يدفع كافة الرسوم والعمولة ويوافق مكتب مرمر على التجديد وتسديد مدة الإيجار اليومي المذكور في العقد
١٥. في حالة عدم التزام المستأجر ببنود هذا العقد يكون للمكتب الحق في أن ينصرف ويحتسب المستأجر على ذلك وفقا لما يتناسب مع مصلحة المؤسسة
١٦. يتحمل المستأجر كافة فواتير الإصلاحات والأعطال الفنية التي تحدث للسيارة خلال فترة التأجير ويتحمل سريان العقد حتى الانتهاء من الإصلاحات والأعطال الفنية للمركبة المؤجرة
١٧. التأجير لمدة يوم يعني ٢٤ ساعة وما زاد عن ذلك يحتسب يوم كامل
١٨. المركبة صالحة للاستعمال في دولة الإمارات المتحدة وبوليصة التأمين سارية في دولة الإمارات المتحدة فقط وخلاف ذلك يتحمل المستأجر كافة المسؤولية
١٩. يتحمل المستأجر عدم إضافة أوراق ملونة على زجاج المركبة أو أي ملصقات أخرى على شكل المركبة، وخلاف ذلك يلتزم المستأجر بدفع تعويض قيمته ٥٠٠ درهم للمكتب كما يتحمل المسؤولية القانونية كاملة أمام الجهات المختصة
٢٠. في حالة حدوث حادث للمركبة على المستأجر أن يقوم بإبلاغ الشرطة ومكتب مرمر فورا وخلاف ذلك يتحمل المسؤولية
٢١. المسافة المحددة للمستأجر ٣٠٠ كيلومتر في اليوم الواحد وما يزيد عن ذلك يدفع ٥٠ فلس للكيلومتر الواحد
٢٢. إذا لم يكن هناك اتفاق مسبق للإيجار الأسبوعي أو الشهري فسوف يحتسب السعر اليومي
٢٣. تأمين الطرف الثالث فقط
٢٤. إذا وقع حادث وكان المستأجر متسببا يتحمل قيمة ٢٥٠٠ درهم
٢٥. يحظر بشدة التدخين داخل السيارة والمستأجر سيكون عرضة لسداد غرامة بمبلغ ٣٠٠ درهم
٢٦. سيتم فرض ضريبة القيمة المضافة بنسبة ٥٪`;

const TERMS_SECTION_3_EN = `MARMAR RENT A CAR hereby authorized to receive from the above said identity holder Traffic Fines and Penalty for Parking the car or any penalty due the police presently`;

const TERMS_SECTION_3_AR = `مرمر لتأجير السيارات مخول بموجب هذا باستلام الغرامات المرورية وغرامات ركن السيارة من حامل الهوية المذكور أعلاه أو أي غرامة مستحقة للشرطة حالياً`;

export async function seedCompanySettings() {
  try {
    // Get or create the singleton settings
    const settings = await storage.getCompanySettings();
    
    // Update with T&C sections if they're empty
    if (!settings.termsSection1En) {
      // Get superadmin user for updatedBy field
      const superadmin = await storage.getUserByUsername("superadmin");
      if (!superadmin) {
        throw new Error("Superadmin user not found - cannot seed company settings");
      }
      
      await storage.updateCompanySettings({
        ...settings,
        currency: "AED",
        vatPercentage: "5",
        termsSection1En: TERMS_SECTION_1_EN,
        termsSection1Ar: TERMS_SECTION_1_AR,
        termsSection2En: TERMS_SECTION_2_EN,
        termsSection2Ar: TERMS_SECTION_2_AR,
        termsSection3En: TERMS_SECTION_3_EN,
        termsSection3Ar: TERMS_SECTION_3_AR,
      }, superadmin.id);
    }
    
    console.log("Company settings seeded successfully");
  } catch (error) {
    console.error("Error seeding company settings:", error);
    throw error;
  }
}
