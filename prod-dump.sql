PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE d1_migrations(
		id         INTEGER PRIMARY KEY AUTOINCREMENT,
		name       TEXT UNIQUE,
		applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
INSERT INTO "d1_migrations" VALUES(1,'0000_fixed_firebird.sql','2026-01-07 03:18:19');
INSERT INTO "d1_migrations" VALUES(2,'0001_damp_marauders.sql','2026-01-07 03:18:19');
INSERT INTO "d1_migrations" VALUES(3,'0002_nostalgic_beyonder.sql','2026-01-07 03:18:19');
CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`accountId` text NOT NULL,
	`providerId` text NOT NULL,
	`accessToken` text,
	`refreshToken` text,
	`idToken` text,
	`accessTokenExpiresAt` integer,
	`refreshTokenExpiresAt` integer,
	`scope` text,
	`password` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
INSERT INTO "account" VALUES('z6cMft2umnAux2ePGUNR0QUA0G3HJIEH','SCA2Y5NjYbn88KZzH7AV1lJ9WmTjHxsI','SCA2Y5NjYbn88KZzH7AV1lJ9WmTjHxsI','credential',NULL,NULL,NULL,NULL,NULL,NULL,'5bf9cfb4ef607b8e7bdd21ba9635ce7d:ac00bf1c7ed45555001ae34d27dff3895f0a04850e6184d31fc162a9f952c24571b2d4018e405c442ee110c17b45094f503a015594e22401262582317ff8a151',1767765830,1767765830);
INSERT INTO "account" VALUES('3f14621e-1c70-4d25-86d3-53a02dafb631','b092b757-7fed-46cf-a01a-4e0b57d9c1d2','3f14621e-1c70-4d25-86d3-53a02dafb631','credential',NULL,NULL,NULL,NULL,NULL,NULL,'5bf9cfb4ef607b8e7bdd21ba9635ce7d:ac00bf1c7ed45555001ae34d27dff3895f0a04850e6184d31fc162a9f952c24571b2d4018e405c442ee110c17b45094f503a015594e22401262582317ff8a151',1767766729,1767766729);
INSERT INTO "account" VALUES('PsXt7Oaoi0BoRwQGaSGfmmrilPXXW61c','b092b757-7fed-46cf-a01a-4e0b57d9c1d2','101734436681014174438','google','ya29.A0Aa7pCA-xkB0JP9uvXQAL-Dl6dyFNozOSlzqfSbkQU5npr2ACTBrsNHc5o6eLURiCdguyIWE2881xshL9n4as-u08cjz0bokzHOU-TfTbfvZPVgn8_EFyn4_ODVn_GVnHb8ya4xlvaqAmPoxlUcQAwJ10adZODZJfprFdOMbmKrsIaK2bVInexX-TOwzG9TgmHqFw2bHmBvoBhWPFfsaKFOCibApBYLylOOqEzya6Hb3YDfMOLEZHvbB-d7JpYj4aNQHMXourmcNJv-9TLmOjv4luyfKDaCgYKAUgSARYSFQHGX2MivfIE1XWsbdbDs9-N--j1dA0291',NULL,'eyJhbGciOiJSUzI1NiIsImtpZCI6IjRiYTZlZmVmNWUxNzIxNDk5NzFhMmQzYWJiNWYzMzJlMGY3ODcxNjUiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIyNzQ5NjczMTc4NjgtbjY5ZTUwcTM2dTg1a211OGFmcDlubG43dm9oc3JmOHIuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiIyNzQ5NjczMTc4NjgtbjY5ZTUwcTM2dTg1a211OGFmcDlubG43dm9oc3JmOHIuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDE3MzQ0MzY2ODEwMTQxNzQ0MzgiLCJlbWFpbCI6InJlemFsaGJyYW1hbnRhcmFAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF0X2hhc2giOiIxWjFFVDZHZFBQZWFBcl8zSHlXMXdBIiwibmFtZSI6IlJlV2luIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0pJTlNXbElwXzY2NWxJWWR6UUVyNVVaVGY1NV9UVDdldjdjNVVPdkxjTzUtM255R2l6WXc9czk2LWMiLCJnaXZlbl9uYW1lIjoiUmVXaW4iLCJpYXQiOjE3Njc3NzYxMzYsImV4cCI6MTc2Nzc3OTczNn0.n6YjYwOAX8D3aJLZwEYZJtB0Mmgd7o0nP3rd2EkVIeIN7kvNKMnAWnhhQ1MMtus_SlSV0aLZ1Swi8NrI-H2h4pO2h3oX-c9gdOqcH5V0T_eB0Le3XoA321FIbzpJEP4UtCNygeNghnjzxC944mqKg_reecLramlTVWieo94tul0AxL3yv6IsbZKSKrI2TqZC5M9NETMKl2Z2IRVFtBNAKpXci5nkHdo7oOV6Mo_tsTY9uvIK9Pz5CC2rAhEvjtpr7v8IfoTew9xxsED4fcbdmOx84KLRYA0xOoxMVGn3bh1y-7tVxzEklD-ppdTDWuuXNCwouUfYBxuWptA7Q1nA1w',1767779734,NULL,'https://www.googleapis.com/auth/userinfo.profile,https://www.googleapis.com/auth/userinfo.email,openid',NULL,1767772644,1767776136);
CREATE TABLE `invitation` (
	`slug` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`partnerEmail` text,
	`content` text DEFAULT '{}',
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
INSERT INTO "invitation" VALUES('desmos','admin@undangan.com',NULL,'{"meta":{"title":"Undangan Pernikahan Rizky & Anisa","description":"Kami mengundang anda untuk hadir di pernikahan kami.\n📅 Sabtu, 28 Des 2025 ⏰ 08.00 WIB \n📍 Masjid Al-Ikhlas ","image":"https://www.bcalife.co.id/storage//articles/wujudkan-pernikahan-sakral-dan-anti-boros-dengan-konsep-intimate-wedding-1718346697.png","updatedAt":1766825876584},"hero":{"groomNickname":"Rizky","brideNickname":"Anisa","date":"SABTU, 28 DESEMBER 2025"},"groom":{"fullName":"Rizky Pratama","parents":"Putra Bpk. Ahmad & Ibu Siti","instagram":"@rizky.pratama","image":"https://api.dicebear.com/7.x/notionists/svg?seed=Rizky"},"bride":{"fullName":"Anisa Wijaya","parents":"Putri Bpk. Budi & Ibu Rina","instagram":"@anisa.wijaya","image":"https://api.dicebear.com/7.x/notionists/svg?seed=Anisa"},"events":{"akad":{"time":"08:00 - 10:00 WIB","date":"Sabtu, 28 Desember 2025","isoDate":"2025-12-28T08:00","location":"Masjid Besar Al-Ikhlas, Jakarta Selatan","mapUrl":"https://goo.gl/maps/placeholder"},"resepsi":{"time":"11:00 - 13:00 WIB","date":"Sabtu, 28 Desember 2025","location":"Grand Ballroom Hotel Mulia, Jakarta","mapUrl":"https://goo.gl/maps/placeholder"}},"gift":{"bankName":"BCA","accountNumber":"1234567890","accountName":"Rizky Pratama","accounts":[{"bankName":"BCA","number":"0123456789","name":"Rizky Sahpora"}]},"music":{"url":"https://music.youtube.com/watch?v=B3E3Ph61cgo&list=RDAMVMB3E3Ph61cgo","fade":true},"rsvp":{"phone":"6281234567890","comments":[{"id":"1766986723617","name":"Test","status":"Hadir","message":"Testing RSVP","createdAt":"2025-12-29T05:38:43.617Z","replies":[]},{"id":"1766986704362","name":"Test","status":"Hadir","message":"Testing RSVP","createdAt":"2025-12-29T05:38:24.362Z","replies":[]}]},"gallery":[]}',1766843955000,1766986723000);
INSERT INTO "invitation" VALUES('wulanrezal','rezalhbramantara@gmail.com',NULL,'{"meta":{"title":"Pernikahan Wulan dan Rezal","description":"Kami mengundang anda untuk hadir di pernikahan kami.\n📅 Sabtu, 28 Des 2025 ⏰ 08.00 WIB \n📍 Masjid Al-Ikhlas ","image":"https://drive.google.com/thumbnail?id=19dRYiEZCPvjDF01yQNr3LJBgT0anF3jp&sz=w1600","updatedAt":1767777227635},"hero":{"groomNickname":"Rezal","brideNickname":"Wulan","date":"Sabtu, 29 Juni 2024","backgroundImage":"https://drive.google.com/thumbnail?id=17S8O1az5cUZ5ARQUm5s1JbF1Q45EN_c0&sz=w1600"},"groom":{"fullName":"Rezal Helwin Bramantara","parents":"Bpk. Totok Anova Rujito & Ibu Kartifa","instagram":"@rezalh_","image":"https://drive.google.com/thumbnail?id=18WJllqxdwkQ-zEl9F9mi5aIRNV9zh1Ma&sz=w1600"},"bride":{"fullName":"Yanuar Fitria Wulandari","parents":"Bpk. Lupa Namanya & Ibu Jolekha","instagram":"@yanuarfw_","image":"https://drive.google.com/thumbnail?id=1A-nHyFmxD02pQsDno0Pwly4fUaMOYhqp&sz=w1600"},"events":{"akad":{"time":"08:00","date":"29 Juni 2024","location":"Masjid Al-Ikhlas"},"resepsi":{"date":"29 Juni 2024","time":"10:00","location":"Gedung BP3K"}},"gift":{"accounts":[{"bankName":"SeaBank","number":"123456789","name":"Yanuar Fitria Wulandari"}]},"music":{"url":"https://music.youtube.com/watch?v=2Kiob5f9A1g&si=8nMzsb4LBf7tx-W0","fade":true},"rsvp":{"phone":"6285229402611","comments":[{"id":"1767759746782","name":"CV. Dunia Indah Permai","status":"Tidak Hadir","message":"Kaaakkkk, Congrats yaaa!!\nSemoga sakinah mawadah warohmah, sorry banget ga bisa datang.. 😭 Lancar-lancar acaranya yaa kakk!","createdAt":"2026-01-07T04:22:26.782Z","replies":[]},{"id":"1766987614523","name":"PT. Kita Sukses Selalu","status":"Hadir","message":"Alhamdulillah Barakallah Komandan!!\nSamawa yaa! Ikut seneng komandan","createdAt":"2025-12-29T05:53:34.523Z","replies":[{"id":"1767074593831","name":"Rezal & Wulan","status":"Mempelai","message":"Terimakasih banyak saudarakuu 🙏😊","createdAt":"2025-12-30T06:03:13.831Z","replies":[]}]},{"id":"1766987547354","name":"Verification Bot","status":"Hadir","message":"Final check after rebuild","createdAt":"2025-12-29T05:52:27.354Z","replies":[]}]},"gallery":["https://drive.google.com/thumbnail?id=1AIX3Rt1wAayNpfZDcMXumqLSEhFeEzC2&sz=w1600","https://drive.google.com/thumbnail?id=1A-nHyFmxD02pQsDno0Pwly4fUaMOYhqp&sz=w1600","https://drive.google.com/thumbnail?id=19YZl4JJvZ1bghQsq0Ts-69kX0_WMo_cT&sz=w1600","https://drive.google.com/thumbnail?id=19_2KCkui35pbaeUYt2dj21zIi0VY4hQE&sz=w1600","https://drive.google.com/thumbnail?id=18WJllqxdwkQ-zEl9F9mi5aIRNV9zh1Ma&sz=w1600","https://drive.google.com/thumbnail?id=19l2SK6mg6nkRbfKEJdRIJ3wqFzzXeTdw&sz=w1600","https://drive.google.com/thumbnail?id=19dRYiEZCPvjDF01yQNr3LJBgT0anF3jp&sz=w1600","https://drive.google.com/thumbnail?id=19p1FljZa2iHkrJ9PC8M9tI8cWVKrC-8N&sz=w1600","https://drive.google.com/thumbnail?id=18TPh4DHlM8E47XHFHimvzuMMNuUWRD2D&sz=w1600","https://drive.google.com/thumbnail?id=19_9dCNOHh2l9NWPf3X3E8cKMYxSsjYWY&sz=w1600","https://drive.google.com/thumbnail?id=19vbbEuCevN1dIQAQDB3c-PkGA2T5V3WD&sz=w1600","https://drive.google.com/thumbnail?id=11D01lib5QwcailWJzM8H_ARPNE6FFRzw&sz=w1600","https://drive.google.com/thumbnail?id=1A7PymHRR90jGlgH6RMQtR-y_izt25nrJ&sz=w1600","https://drive.google.com/thumbnail?id=1AC-A4D5OnDsYfXHVDe7BaeLFf1J84BB-&sz=w1600","https://drive.google.com/thumbnail?id=1A9AK7FuzEHCV1sGQEBsUHxC-JwZvJSrt&sz=w1600","https://drive.google.com/thumbnail?id=19D-gA0YHpD3pfmZ8oHTdc_-e4IavCUTD&sz=w1600","https://drive.google.com/thumbnail?id=115Hpw3CHoLWnAiNLWAy4k5SV5S6GB47Q&sz=w1600","https://drive.google.com/thumbnail?id=18GZES33GGwClNZbwNUCcr4N_GEP-EImL&sz=w1600","https://drive.google.com/thumbnail?id=18aGRtfc9gUVYExc6MwgCXUdPQPVkfHEI&sz=w1600","https://drive.google.com/thumbnail?id=11PM7SMlf4_Fzd6cxBrQSsfvh2XrijWvq&sz=w1600","https://drive.google.com/thumbnail?id=18Kn0h918Ua-P2wf2O4NusGHI8ZQmDDBJ&sz=w1600","https://drive.google.com/thumbnail?id=1865RSpZIe4veWeWbBC74a2nmq8uzRTHD&sz=w1600","https://drive.google.com/thumbnail?id=180lcnSUT-nQu3W8Yqo60Vh1BgGm4b3Yx&sz=w1600","https://drive.google.com/thumbnail?id=19QzYRjt2nF6AZbjAMRm9-xXhNuMgLQCk&sz=w1600","https://drive.google.com/thumbnail?id=196S81n5_YH3M-9hqiSnNySBq51RtgDxU&sz=w1600","https://drive.google.com/thumbnail?id=191WbWPUZcCQU4XvDqlvMuvD_Z6gV0UZe&sz=w1600","https://drive.google.com/thumbnail?id=11KtQX1OSnftxaw5bhbdCuRUfJ71d_hji&sz=w1600","https://drive.google.com/thumbnail?id=19AwcZUhYOJE9nWaflVN6rRQfOVHLQleE&sz=w1600","https://drive.google.com/thumbnail?id=18sIoAHyGG1YDOIGuYqtzrtnko5ZpKh3X&sz=w1600","https://drive.google.com/thumbnail?id=19FjtnMj9jfmGveD6i1DUcqfqxVfRZ_Ew&sz=w1600","https://drive.google.com/thumbnail?id=11eRDfKJK8g9Rtg6Hv68hEgrrHM3kYCSd&sz=w1600","https://drive.google.com/thumbnail?id=11zp7rJVFROykAZ9pKSVAQg6wjvPogr-K&sz=w1600","https://drive.google.com/thumbnail?id=11f-0lM-shkwPC3x3Nxaqalyq7rzalLr_&sz=w1600","https://drive.google.com/thumbnail?id=11IivCNrn3qmANmuuNsKVY5kiRp0VYZPi&sz=w1600","https://drive.google.com/thumbnail?id=11kZwS1Mbub-_fbPR1Lz7ebXsaEI-fHVK&sz=w1600","https://drive.google.com/thumbnail?id=11-nz7Oqlt6u7IXsiylTfOk9JTj2O1Rca&sz=w1600","https://drive.google.com/thumbnail?id=11few1gIKIPO9ZJjnl89xZBrW-GaFmrvD&sz=w1600","https://drive.google.com/thumbnail?id=116EAmHsgOIiTmCkYJg51z2f6lYODj3kk&sz=w1600","https://drive.google.com/thumbnail?id=19OSzfukjfHxIl-tYVseoJgriu3NStDo4&sz=w1600","https://drive.google.com/thumbnail?id=11moen7zcAMPrXbNo-EqW5BzoOWu_7p1f&sz=w1600","https://drive.google.com/thumbnail?id=11w4O4XucnA5Uf9oXQnzwMKxhDPpjRAKP&sz=w1600","https://drive.google.com/thumbnail?id=118KBbvX8IqS9bM48dr2R3LthZpKk50bd&sz=w1600","https://drive.google.com/thumbnail?id=11nj7bDrO534LGy8CQXmqccxOTWJlODpg&sz=w1600","https://drive.google.com/thumbnail?id=1-gdc1kVjgDDm7s61BoBBGQRmZGHdhIal&sz=w1600","https://drive.google.com/thumbnail?id=11OEoA5HwuMB3ayvV974CtvdRr_Z9BXS0&sz=w1600","https://drive.google.com/thumbnail?id=11vxat-nHMOOMnJ19rXyKlEvbrUCPMzyy&sz=w1600","https://drive.google.com/thumbnail?id=1-88SSD35_vWMulcDquulI1MuhXD3HXkW&sz=w1600","https://drive.google.com/thumbnail?id=11_IzXpU5Duk37VNP-m4blx5gNDPaWCoe&sz=w1600","https://drive.google.com/thumbnail?id=11TZVtqz2dmM5bR3tM3w04H3DUneChJdf&sz=w1600","https://drive.google.com/thumbnail?id=11bT1tpFOzbxuAVYzFrNqgnO91K-ifdwi&sz=w1600","https://drive.google.com/thumbnail?id=1-9wYO1qchjYLOkXC3p9ljXC68EwOtK22&sz=w1600","https://drive.google.com/thumbnail?id=10-S2wEN5ejD0O96qoy4in89AQy9SQ5d5&sz=w1600","https://drive.google.com/thumbnail?id=1-wqP12YkxEPrt2aPMzEXyR5ktvpZChpQ&sz=w1600","https://drive.google.com/thumbnail?id=1-sDsS6Y4tLUy1rUqigwlWLuPKsGNCbHx&sz=w1600","https://drive.google.com/thumbnail?id=11W-F93atAaQFNtpnRb6Y17IEBZ_EUC-t&sz=w1600","https://drive.google.com/thumbnail?id=1-v171C8LL53sJaw1nCZQjcxBPIeQ_LIZ&sz=w1600","https://drive.google.com/thumbnail?id=1-waUasQ_Qrf2v5dX_Z2mPjsWcfhZrFgX&sz=w1600","https://drive.google.com/thumbnail?id=1-YUzyHIiSgX9POhO_kN4HGqiP1EOUQQZ&sz=w1600","https://drive.google.com/thumbnail?id=11UwtaOuuPQ6ot2CG1TwIq6EFnsdIlxHB&sz=w1600","https://drive.google.com/thumbnail?id=101HuqAA4cwQjme3pzMZompmkkFnFe8Nb&sz=w1600","https://drive.google.com/thumbnail?id=10htpicGYZ0QCsMIwEn9UjLRAYAcf4jqK&sz=w1600","https://drive.google.com/thumbnail?id=10TUfSmHkrzQUQVwd8_xxhK3zbDFCkQkj&sz=w1600","https://drive.google.com/thumbnail?id=10gOlVV5XdXx9dpmNUbSMouceWUXybzCg&sz=w1600","https://drive.google.com/thumbnail?id=1-dDC1KFnl9qRBVab_tRPP333cZqEAP9-&sz=w1600","https://drive.google.com/thumbnail?id=10bS2CDISOMD2HpYRsPDkN3A9_87ffwRP&sz=w1600","https://drive.google.com/thumbnail?id=106CG1UcHJ7M9q8eKW6wntfN-3fFoeyBn&sz=w1600","https://drive.google.com/thumbnail?id=10fG7yw1dkKpurSUenC_baHpkt38Ltnn_&sz=w1600","https://drive.google.com/thumbnail?id=10jF1p_ImH_By-gSqWTmpQEShxRwrHM0-&sz=w1600","https://drive.google.com/thumbnail?id=10r_iMNu2yXze-VGccxMPjWuwjIQzl3qC&sz=w1600","https://drive.google.com/thumbnail?id=10ojkytiYfB__-jqf0D-YUjU0ClCH2Ben&sz=w1600","https://drive.google.com/thumbnail?id=10z7-AVCN3YikbqtbKAGChrZkCSCGuYj3&sz=w1600","https://drive.google.com/thumbnail?id=112dFpYBWqNBZTCAbSSZSFjgoZKGiS4qb&sz=w1600","https://drive.google.com/thumbnail?id=1-UKnDjNB2lukgfn9CvDeUvIV6RpIyf70&sz=w1600","https://drive.google.com/thumbnail?id=1-T0W8lhC4eaTyB38sdQq4twZ_BiUxosM&sz=w1600","https://drive.google.com/thumbnail?id=1-PqqaunekDVwf5iTl7V_ffvmLWeliHZj&sz=w1600","https://drive.google.com/thumbnail?id=1-MoWBJH_C8rrPt4NZXXPWe1ZotFquBWE&sz=w1600","https://drive.google.com/thumbnail?id=1-ZtM9x9SDXJkuPnTJLxtRMuIH07uQzAP&sz=w1600","https://drive.google.com/thumbnail?id=1-HKQlDr0IJr8opWDc_q69UADbkOpUP_o&sz=w1600","https://drive.google.com/thumbnail?id=1-U14YlqtpV47tB1ZJbNeNjOTbkKAlcqR&sz=w1600","https://drive.google.com/thumbnail?id=1-_TifTD4McdOciR3olNPNLh1HxxoysjE&sz=w1600","https://drive.google.com/thumbnail?id=1-I9Es_9-OpM1CSsqx0Mp1c3iq-wTNwXH&sz=w1600","https://drive.google.com/thumbnail?id=1-tsRFmReH8pMxiL0q79RHwfIlbc3CpX8&sz=w1600","https://drive.google.com/thumbnail?id=173Tq5eRip0UhlDzsgaEKBPE1T4HvhJtv&sz=w1600","https://drive.google.com/thumbnail?id=17504bw1UMZC2HQqLuJRBtRgpEKuQ44Px&sz=w1600","https://drive.google.com/thumbnail?id=177QYGIZ8xyiUAS2ssDqibTaFfGAb44Jf&sz=w1600","https://drive.google.com/thumbnail?id=17BGVTdyhMrEKYDyTwjsg1DflHDZb9Cvg&sz=w1600","https://drive.google.com/thumbnail?id=17Lxi2dBxV4wQziNEn9yeacGybmnWH0VM&sz=w1600","https://drive.google.com/thumbnail?id=17Ocjggf43y7RjX4H6hwpE92yNWqXPnmK&sz=w1600","https://drive.google.com/thumbnail?id=17S8O1az5cUZ5ARQUm5s1JbF1Q45EN_c0&sz=w1600","https://drive.google.com/thumbnail?id=17aR_htQwmCNNKvLPpsv0gX47FBZ6IIam&sz=w1600","https://drive.google.com/thumbnail?id=17dyWptP6ve2Wg90mf84bUkg9zZcS0KzS&sz=w1600","https://drive.google.com/thumbnail?id=17hvp6FlD3MIC0tmLQ7hH_jeeZ0dnDBD6&sz=w1600","https://drive.google.com/thumbnail?id=17kHCmPs6LM8Lp0v8VSxod94-WoMOogWT&sz=w1600","https://drive.google.com/thumbnail?id=17kfGiXU-03cz-0U9fWSEXdpbkLvhaggD&sz=w1600","https://drive.google.com/thumbnail?id=17tNZo29nhAH0ibhdMKq8rV9u2zT62ND6&sz=w1600","https://drive.google.com/thumbnail?id=17w_uo6goS33HPA95Aa6YVAdNmD9xTEWw&sz=w1600","https://drive.google.com/thumbnail?id=17wgf6Tjc_UOB00t1jGgJ-V6PCAAeYd1e&sz=w1600","https://drive.google.com/thumbnail?id=169w6w4Iz2w3bNLozAGEDlM6KZe6ybzwk&sz=w1600","https://drive.google.com/thumbnail?id=16DPXf9k1GMiBYt6i9NxGgBva2Wv2DGvm&sz=w1600","https://drive.google.com/thumbnail?id=16FLIV--fdQmCnl2X3ne3dX7jaIOBDASS&sz=w1600"],"cover":{"backgroundImage":"https://drive.google.com/thumbnail?id=115Hpw3CHoLWnAiNLWAy4k5SV5S6GB47Q&sz=w1600"},"_auth":{"isAuthorized":true,"owner":"rezalhbramantara@gmail.com","partnerEmail":null},"theme":"original"}',1766843955000,1767777227);
INSERT INTO "invitation" VALUES('anu','anu@anu.anu','rezalhiis2@gmail.com','{"meta":{"title":"Wedding Invitation","description":""},"hero":{"groomNickname":"Groom","brideNickname":"Bride","date":"Date"},"groom":{"fullName":"","parents":"","instagram":"","image":""},"bride":{"fullName":"","parents":"","instagram":"","image":""},"events":{"akad":{},"resepsi":{}},"gift":{},"music":{},"rsvp":{}}',1767006779000,1767006779000);
CREATE TABLE `order` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`plan` text NOT NULL,
	`amount` integer NOT NULL,
	`status` text DEFAULT 'pending',
	`proofUrl` text,
	`referrerId` text,
	`referralDiscount` integer DEFAULT 0,
	`ipAddress` text,
	`externalId` text,
	`paymentUrl` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
INSERT INTO "order" VALUES('ff4a130b-1266-4f5d-b330-412ed0956a69','f0d87c17-cdcc-4fe5-9d82-4287a77c6ab7','vip',50000,'approved',NULL,NULL,0,NULL,NULL,NULL,1766937428000,1766937631000);
INSERT INTO "order" VALUES('Z9QLVTIC4JCaSDKI6xPZV','HgWohipqGfLHKklnuiOlzN0VVqKKTjqO','regular',49263,'rejected',NULL,NULL,0,NULL,NULL,NULL,1767002500000,1767766915);
INSERT INTO "order" VALUES('-kpp5S-xj6xE3IviUso7q','HgWohipqGfLHKklnuiOlzN0VVqKKTjqO','regular',49574,'rejected',NULL,NULL,0,NULL,NULL,NULL,1767004299000,1767771479);
INSERT INTO "order" VALUES('iYELUv8fo5xOxgsfy3W4Q','HgWohipqGfLHKklnuiOlzN0VVqKKTjqO','regular',49161,'rejected',NULL,NULL,0,NULL,NULL,NULL,1767004304000,1767770098);
INSERT INTO "order" VALUES('nGedzHNHK4Myd_06VhcJz','HgWohipqGfLHKklnuiOlzN0VVqKKTjqO','regular',49136,'rejected',NULL,NULL,0,NULL,NULL,NULL,1767004315000,1767769842);
INSERT INTO "order" VALUES('8jTW3OBAbj2IALKVyGRf-','HgWohipqGfLHKklnuiOlzN0VVqKKTjqO','vip',99386,'rejected',NULL,NULL,0,NULL,NULL,NULL,1767004604000,1767768568);
INSERT INTO "order" VALUES('hTNgSjgMKQg5bsewP3ZBY','HgWohipqGfLHKklnuiOlzN0VVqKKTjqO','vip',99938,'rejected',NULL,NULL,0,NULL,NULL,NULL,1767004630000,1767768561);
INSERT INTO "order" VALUES('ESKojO1ZfCb0oFIDPgceK','HgWohipqGfLHKklnuiOlzN0VVqKKTjqO','vip',99652,'rejected',NULL,NULL,0,NULL,NULL,NULL,1767004638000,1767768548);
INSERT INTO "order" VALUES('hR4u5K2kGlxfhSi9M0Gun','HgWohipqGfLHKklnuiOlzN0VVqKKTjqO','vip',99028,'rejected',NULL,NULL,0,NULL,NULL,NULL,1767004798000,1767768540);
INSERT INTO "order" VALUES('w-vOyGux-j6lG9GawTg78','HgWohipqGfLHKklnuiOlzN0VVqKKTjqO','vip',99196,'rejected',NULL,NULL,0,NULL,NULL,NULL,1767004804000,1767768538);
INSERT INTO "order" VALUES('1a2JFJ8T2oVHmCOJ7_4Fx','HgWohipqGfLHKklnuiOlzN0VVqKKTjqO','vip',99219,'rejected',NULL,NULL,0,NULL,NULL,NULL,1767004807000,1767767749);
INSERT INTO "order" VALUES('GdSRcccPEKlVEeV03EJEp','HgWohipqGfLHKklnuiOlzN0VVqKKTjqO','vip',99060,'rejected',NULL,NULL,0,NULL,NULL,NULL,1767004810000,1767767731);
INSERT INTO "order" VALUES('Cn9tqiSakEhL1JGyjGvBf','HgWohipqGfLHKklnuiOlzN0VVqKKTjqO','regular',49103,'rejected',NULL,NULL,0,NULL,NULL,NULL,1767004826000,1767767499);
INSERT INTO "order" VALUES('6APrzkxbgtHa_tI5gQEV4','HgWohipqGfLHKklnuiOlzN0VVqKKTjqO','vip',99203,'rejected',NULL,NULL,0,NULL,NULL,NULL,1767005059000,1767766911);
INSERT INTO "order" VALUES('jcI0VURfiCOV5wzY3o8jI','HgWohipqGfLHKklnuiOlzN0VVqKKTjqO','regular',49246,'rejected',NULL,NULL,0,NULL,NULL,NULL,1767005104000,1767766899);
INSERT INTO "order" VALUES('bmEzt6HsfBZ0vx1YrrKcI','HgWohipqGfLHKklnuiOlzN0VVqKKTjqO','vip',99097,'rejected',NULL,NULL,0,NULL,NULL,NULL,1767005615000,1767766844);
INSERT INTO "order" VALUES('ysrsz5dV_6EAJV50ft6Yf','HgWohipqGfLHKklnuiOlzN0VVqKKTjqO','vip',99224,'rejected',NULL,NULL,0,NULL,NULL,NULL,1767005628000,1767098447000);
INSERT INTO "order" VALUES('wxak6FuFl1yWOg-xMiY-L','HgWohipqGfLHKklnuiOlzN0VVqKKTjqO','vip',99147,'rejected',NULL,NULL,0,'125.166.9.102',NULL,NULL,1767068127000,1767098445000);
CREATE TABLE `referral_transaction` (
	`id` text PRIMARY KEY NOT NULL,
	`referrerId` text NOT NULL,
	`refereeId` text NOT NULL,
	`amount` integer NOT NULL,
	`type` text NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`referrerId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`refereeId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`token` text NOT NULL,
	`expiresAt` integer NOT NULL,
	`ipAddress` text,
	`userAgent` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
INSERT INTO "session" VALUES('76koMOabK4ur4ga08U3DYmHCs3J5CDsW','SCA2Y5NjYbn88KZzH7AV1lJ9WmTjHxsI','Z55lzNrGhDtnAoh3y1AZJUrhAquKvcCc',1768370630,'125.166.8.172','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',1767765830,1767765830);
INSERT INTO "session" VALUES('5tKG2thF4MEmvn5YcINIOutyG9gUHPz4','b092b757-7fed-46cf-a01a-4e0b57d9c1d2','OOlVDXBAEu9HWNTcvYJZyxwleI59AKQb',1768371625,'125.166.8.172','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',1767766825,1767766825);
INSERT INTO "session" VALUES('ejyOMaWaJaaneU18HjmVrhPNo7olaLIE','b092b757-7fed-46cf-a01a-4e0b57d9c1d2','MtkAmjOlx56407oxxDD6u0Pme9MXnIJk',1768377444,'125.166.8.172','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',1767772644,1767772644);
INSERT INTO "session" VALUES('DD8wHmdZ46djQh10C4xGYFjkfTDXP4oA','b092b757-7fed-46cf-a01a-4e0b57d9c1d2','81TqUdndWANi2nwh2a15hIb0mqx83Dvr',1768377887,'125.166.8.172','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',1767773087,1767773087);
INSERT INTO "session" VALUES('McGlxqRmThuFbsM0vs6SKggD3XaakN9u','b092b757-7fed-46cf-a01a-4e0b57d9c1d2','bFTFBIgevE4jenI0lRPx4tBY6PWE1ZqM',1768378051,'125.166.8.172','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',1767773251,1767773251);
INSERT INTO "session" VALUES('j8syj1MgWQTbgqTBWEhsrmODkN0LmXmb','b092b757-7fed-46cf-a01a-4e0b57d9c1d2','6eQoPkNLnTTbFMjNNNC3429ELdXW03Rc',1768378845,'125.166.8.172','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',1767774045,1767774045);
INSERT INTO "session" VALUES('gDyZqfE2NxMQlhexjDA0HLxV1RocvpsM','b092b757-7fed-46cf-a01a-4e0b57d9c1d2','tsQmdGTjtsRzGRQTEdYetx6hr45icGY5',1768378923,'125.166.8.172','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',1767774123,1767774123);
INSERT INTO "session" VALUES('IUDe95L5LoVcW3wumR9c0Vnn250hbMlg','b092b757-7fed-46cf-a01a-4e0b57d9c1d2','y6Lr3WCNOEKVl5c6zEqUBQQtWiuzkfZJ',1768380010,'125.166.8.172','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',1767775210,1767775210);
INSERT INTO "session" VALUES('MHjZNRglkzEKoWIsbr7OWApfanOYH70K','b092b757-7fed-46cf-a01a-4e0b57d9c1d2','QSZq8KOdhbt4j3WY3gU7O6dz0t0wAA3M',1768380475,'125.166.8.172','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',1767775675,1767775675);
INSERT INTO "session" VALUES('aXbJA0wEvTsKvUWedYRvYzdCh12kottO','b092b757-7fed-46cf-a01a-4e0b57d9c1d2','Vm0IG8gW6leyvvFoLtKnXRrm3J0N0p2s',1768380936,'125.166.8.172','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',1767776136,1767776136);
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`emailVerified` integer NOT NULL,
	`image` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`role` text DEFAULT 'user',
	`plan` text DEFAULT 'free',
	`planExpiresAt` integer,
	`maxInvitations` integer DEFAULT 1,
	`maxGuests` integer DEFAULT 25,
	`referralCode` text,
	`referredBy` text,
	`referralBalance` integer DEFAULT 0,
	`phoneNumber` text,
	`bankName` text,
	`bankAccountNumber` text,
	`bankAccountName` text,
	`registrationIp` text
);
INSERT INTO "user" VALUES('b34beee5-72a2-479b-bf71-b434f0daae6e','Super Admin','support@zalan.web.id',1,NULL,1766843955000,1766899486000,'admin','vvip',NULL,9999,25,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL);
INSERT INTO "user" VALUES('b092b757-7fed-46cf-a01a-4e0b57d9c1d2','Rezal Helwin Bramantara','rezalhbramantara@gmail.com',1,NULL,1766843955000,1766899488000,'admin','vvip',NULL,9999,25,'8888EB',NULL,0,NULL,NULL,NULL,NULL,NULL);
INSERT INTO "user" VALUES('j4voo4n0Iq6R17QFh8pN9dcnD3Sl6xai','Test Admin','testadmin@zalan.web.id',0,NULL,1766892813000,1766899492000,'admin','vvip',NULL,9999,25,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL);
INSERT INTO "user" VALUES('ec8ef5f8dfd848189ca4b64681d99cb5','User Tamu','tamu@zalan.web.id',1,NULL,1766893775000,1766893775000,'user','free',NULL,1,25,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL);
INSERT INTO "user" VALUES('HgWohipqGfLHKklnuiOlzN0VVqKKTjqO','anu','anu@anu.anu',0,NULL,1766908221000,1766920200000,'user','free',NULL,1,25,'576C28',NULL,0,NULL,NULL,NULL,NULL,NULL);
INSERT INTO "user" VALUES('f4a5d4b8-7346-4f3a-be8c-da882f2ad5ed','Test User','test-f4a5d4b8-7346-4f3a-be8c-da882f2ad5ed@example.com',1,NULL,1766937361000,1766937361000,'user','free',NULL,1,25,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL);
INSERT INTO "user" VALUES('f0d87c17-cdcc-4fe5-9d82-4287a77c6ab7','Test User','test-f0d87c17-cdcc-4fe5-9d82-4287a77c6ab7@example.com',1,NULL,1766937428000,1766937631000,'user','vip',NULL,20,25,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL);
INSERT INTO "user" VALUES('qPS1PZs0TGd39sZjDDsFoBpATMnzTjYG','rezalh docs','rezalhdocs@gmail.com',1,'https://lh3.googleusercontent.com/a/ACg8ocJxEHlkvlAILzEwVYd7yQ4KqU0zLba2Xq7gS7BjQXKgOYsFUQ=s96-c',1767098407000,1767098407000,'user','free',NULL,1,25,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL);
INSERT INTO "user" VALUES('3xPcfJai6zEDNMe1ihmK6LM1kf500gn9','Abdullah Anshori','abdullahanshori07@gmail.com',1,'https://lh3.googleusercontent.com/a/ACg8ocK5MVxBYmpzcYYPUlSwnnGW3l80ybnktL-iNBlak6GxiMcqGw=s96-c',1767317332000,1767317332000,'user','free',NULL,1,25,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL);
INSERT INTO "user" VALUES('SCA2Y5NjYbn88KZzH7AV1lJ9WmTjHxsI','Temp Admin','temp-admin@test.com',0,NULL,1767765830,1767765830,'user','free',NULL,1,25,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL);
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expiresAt` integer NOT NULL,
	`createdAt` integer,
	`updatedAt` integer
);
CREATE TABLE `guest` (
	`id` text PRIMARY KEY NOT NULL,
	`invitationSlug` text NOT NULL,
	`name` text NOT NULL,
	`phoneNumber` text,
	`note` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`invitationSlug`) REFERENCES `invitation`(`slug`) ON UPDATE no action ON DELETE no action
);
CREATE TABLE `system_setting` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updatedAt` integer NOT NULL
);
CREATE TABLE `wa_notification` (
	`id` text PRIMARY KEY NOT NULL,
	`phoneNumber` text NOT NULL,
	`message` text NOT NULL,
	`status` text DEFAULT 'pending',
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
DELETE FROM sqlite_sequence;
INSERT INTO "sqlite_sequence" VALUES('d1_migrations',3);
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);
CREATE UNIQUE INDEX `user_referralCode_unique` ON `user` (`referralCode`);
