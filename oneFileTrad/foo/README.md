# Notes de traduction du Bussard


## Description

Les notes de traduction Bussard sont un dérivé des notes de traduction unfoldingWord®. Ces notes sont des notes exégétiques sous licence ouverte qui fournissent des informations historiques, culturelles et linguistiques aux traducteurs. Elles fournissent aux traducteurs et aux vérificateurs des informations pertinentes, juste à temps, pour les aider à prendre les meilleures décisions possibles en matière de traduction.

## Édition de l'UTN

Pour éditer les fichiers UTN, vous avez trois possibilités :

* Utiliser LibreOffice (recommandé)
* Utiliser un éditeur de texte sur votre ordinateur
* Utiliser l'éditeur web en ligne du SCD

Chacune de ces options et leurs mises en garde sont décrites ci-dessous.

Les deux premières options nécessitent que vous cloniez d'abord le référentiel sur votre ordinateur. Vous pouvez le faire en ligne de commande ou en utilisant un programme tel que SmartGit. Après avoir apporté des modifications aux fichiers, vous devrez commiter et pousser vos modifications sur le serveur, puis créer une Pull Request pour les fusionner avec la branche `master`.


### Édition dans tC Create

C'est la méthode recommandée pour éditer les fichiers TSV. tC Create est une application web à laquelle vous pouvez accéder [here](https://create.translationcore.com). REMARQUE : vous devez disposer d'un compte Door43 pour pouvoir utiliser tC Create.

Une fois que vous vous êtes connecté, suivez simplement les instructions pour ouvrir le fichier que vous souhaitez modifier.

Lorsque vous avez fini de modifier, cliquez sur le bouton Enregistrer dans le coin supérieur droit de l'écran.

### Modifier dans un éditeur de texte

Vous pouvez également utiliser un éditeur de texte ordinaire pour apporter des modifications aux fichiers.

**Note :** Vous devez faire attention à ne pas supprimer ou ajouter de caractères de tabulation lorsque vous éditez avec cette méthode.

### Édition dans le SCD

Si vous n'avez besoin de modifier qu'un mot ou deux, cette méthode peut être la plus rapide pour effectuer votre modification. Consultez le document [protected branch workflow](https://help.door43.org/en/knowledgebase/15-door43-content-service/docs/46-protected-branch-workflow) pour des instructions étape par étape.

**Note :** Vous devez faire attention à ne pas supprimer les caractères de tabulation lorsque vous éditez avec cette méthode. De plus, vous NE POUVEZ PAS saisir manuellement les caractères de tabulation à l'aide de la barre de tabulation de votre clavier, car DCS les enregistrera comme des espaces et non comme des séparateurs de tabulation. La meilleure façon d'insérer des séparateurs de tabulation est de copier et coller les caractères de tabulation d'une note existante.

## Structure

Les UTN sont structurées comme des fichiers TSV pour simplifier l'importation et l'exportation dans différents formats pour la traduction et la présentation. Cela permet aux UTN d'être rattachées au texte original grec et hébreu au lieu de n'être qu'une traduction en langue Gateway.

### Aperçu du format TSV

Un fichier TSV (Tab Separated Value) ressemble à un fichier Comma Separated Value, sauf que c'est le caractère tabulation qui divise les valeurs au lieu d'une virgule. Il est ainsi plus facile d'inclure du texte en prose dans les fichiers, car de nombreuses langues exigent l'utilisation de virgules, de guillemets simples et de guillemets doubles dans leurs phrases et paragraphes.

Les UTN sont structurés en un fichier par livre de la bible et encodés au format TSV, par exemple, `01-GEN.tsv`. Les colonnes sont `Livre`, `Chapitre`, `Verse`, `ID`, `SupportReference`, `OrigineQuote`, `Occurrence`, `GLQuote`, et `OccurrenceNote`.

### Description des colonnes TSV de l'UTN

Ce qui suit liste chaque colonne avec une brève description et un exemple.

* `Book` : Nom de code du livre de l'USFM (par exemple, `TIT`)
* `Chapitre` : Numéro du chapitre (par exemple, `1`)
* `Verse` : Numéro du verset (par exemple, `3`)
* `ID` : Quatre caractères **alphanumériques** chaîne unique *dans* le verset pour la ressource (par exemple `swi9`).
  * Ceci sera utile pour identifier quelles notes sont des traductions des tNs anglaises originales et quelles notes ont été ajoutées par les GLs.
  * L'identifiant universel (UID) d'une note est la combinaison des champs `Livre`, `Chapitre`, `Verset` et `ID`. Par exemple, `tit/1/3/swi9`.
    * C'est un moyen utile de se référer sans ambiguïté aux notes.
    * Un [RC link](https://resource-container.readthedocs.io/en/latest/linking.html) peut se résoudre à une note spécifique comme ceci : `rc://fr/tn/help/tit/01/01/swi9`.
* `SupportReference`
  * Normalement, un lien vers un texte de référence ou une page blanche.
  * Ce sera généralement un lien vers translationAcademy, comme `rc://*/ta/man/translate/figs-metaphor`.
* `OrigQuote` : Citation en langue originale (par exemple `ἐφανέρωσεν...τὸν λόγον αὐτοῦ`)
  * Les logiciels (tels que tC) devraient l'utiliser pour déterminer ce qui est mis en évidence plutôt que d'utiliser le champ `GLQuote`.
  * Un caractère ellipse (...) indique que la citation est discontinue, le logiciel doit l'interpréter de manière non avide.
* `Occurrence` : Indique à quelle occurrence dans le texte de la langue originale l'entrée s'applique.
  * `-1` : l'entrée s'applique à chaque occurrence de OrigQuote dans le verset.
  * `0` : l'entrée n'apparaît pas dans la langue originale (par exemple, "Connecting Statement :")
  * `1` : l'entrée s'applique à la première occurrence de OrigQuote seulement
  * `2` : l'entrée s'applique uniquement à la deuxième occurrence de OrigQuote
  * etc.
* `GLQuote` : (facultatif) citation en langue de la passerelle (par exemple `il a révélé sa parole`)
  * Les logiciels (tels que tC) ne doivent pas tenir compte de ce champ.
  * Ce champ est un texte de référence pour les traducteurs GL
  * Pour certaines notes, ce champ représente le texte d'affichage des notes qui ne se rapportent pas à un mot ou une phrase spécifique du texte. Il y a deux cas de ce genre dans le tN :
    * "Déclaration de connexion :" et
    * "Informations générales :"
  * Les équipes de traduction GL **ne doivent pas traduire** cette colonne. Elles doivent cependant fournir une traduction des 2 déclarations ci-dessus.
* `OccurrenceNote` : La note formatée en Markdown elle-même. Par exemple, `Paul parle du message de Dieu comme s'il s'agissait d'un objet que l'on peut montrer visiblement aux gens. Autre traduction possible : "Il m'a fait comprendre son message" (Voir : [[rc://en/ta/man/translate/figs-metaphor]])`.
  * Le texte doit être formaté en Markdown, ce qui signifie que les éléments suivants sont également acceptables :
    * Plaintext - si vous n'avez pas besoin de balises supplémentaires, utilisez simplement du texte brut dans cette colonne.
    * HTML - si vous préférez utiliser du HTML en ligne pour le balisage, cela fonctionne car c'est pris en charge par Markdown.

## Composition des notes de traduction

Vous trouverez ci-dessous quelques directives de formatage qui régissent la composition des transationNotes.

* Toutes les tNotes doivent référencer UN SEUL article de translationAcademy. Si un deuxième article doit être référencé, il faut ajouter une autre tNote.
* Toutes les notes doivent faire référence à l'un des articles "Just-in-Time" de translationAcademy, c'est-à-dire ceux dont le nom de fichier commence par "figs-" ou "grammar-" "translate-" ou "writing-".
* Le terme/concept ULT abordé dans chaque note doit figurer en caractères gras **>**, et NON entre guillemets.
* N'utilisez les guillemets que pour indiquer les traductions suggérées. Ne faites pas précéder la suggestion du mot "that" (qui les transforme en guillemets indirects) ; par exemple, vous pourriez dire que "ils prévoyaient de l'assassiner". Corrigé en : Vous pourriez dire : "ils prévoyaient de l'assassiner".
* Il ne suffit pas de mettre "par exemple" entre virgules au milieu de la phrase et de le faire suivre d'un exemple, par exemple, vous pouvez dire ceci avec une forme active, par exemple, "Mardochée a découvert ce qu'ils préparaient." Corrigé en : Vous pouvez le dire avec une forme active, par exemple : "Mardochée a découvert ce qu'ils préparaient." Un autre exemple pourrait être : Vous pouvez dire ceci avec une forme active, et vous pouvez dire qui a fait l'action. Par exemple, vous pouvez dire : "Alors les serviteurs du roi ont enquêté sur le rapport de Mardochée et ont découvert qu'il était vrai."
* Lorsque vous commencez une tNotes par le mot "Ici", le terme doit être suivi d'une virgule. Par exemple : "Ici, le terme **ULT** signifie ..."
* Ne PAS inclure de point à la fin du fragment "Autre traduction :" à la fin d'une note technique. La "Traduction alternative" doit être formatée comme un fragment de phrase flottant immédiatement suivi de l'hyperlien translationAcademy (le cas échéant), c'est-à-dire, Traduction alternative : "en présence de Yahvé" (Voir : Métaphore)
* Lorsque vous composez des notes en ligne à l'aide de tC Create, tous les hyperliens doivent être saisis en mode "Markdown" et non en mode "Aperçu". Les hyperliens saisis en mode "Preview" ne seront pas sauvegardés dans leur format correct.
* Les références bibliques au sein d'un même livre doivent être référencées en utilisant à la fois le chapitre et le verset, séparés par deux points, par exemple 3:16. Pour reprendre ce même exemple, le format correct des hyperliens place le texte de l'hyperlien entre parenthèses [3:16], suivi immédiatement du lien lui-même entre parenthèses (../03/16.md). Il ne doit pas y avoir d'espace entre les crochets et les parenthèses.
* Le nom du fichier dans le champ SupportReference DOIT correspondre exactement au lien hypertexte à la fin de la note. S'ils ne correspondent pas, le lien ne fonctionnera pas correctement.

## Traducteurs GL

### Philosophie de la traduction tN

Pour connaître la philosophie de la traduction de ces notes, veuillez consulter l'article [Translate the translationNotes](https://gl-manual.readthedocs.io/en/latest/gl_translation.html#gltranslation-transtn) dans la [Gateway Language Manual](https://gl-manual.readthedocs.io/).

### Notes de traduction tN

Voici quelques *notes* techniques importantes à garder à l'esprit lorsque vous traduisez tN :

* Seule la colonne `OccurrenceNote` doit être traduite.
* Ne supprimez aucune colonne dans les fichiers TSV.
* Vous devrez également fournir une traduction de ces 2 phrases qui sont répétées, "Connecting Statement :" et "General Information :".
  * Ces phrases apparaissent plusieurs fois dans la colonne `GLQuote`.
  * Vous pouvez utiliser la fonction de recherche et de remplacement pour mettre à jour le texte anglais avec votre texte GL. Sinon, nous pouvons le faire lors de la préparation du texte pour la publication.
* N'oubliez pas : il n'est pas nécessaire de remplir la colonne "GLQuote". N'utilisez ce champ que s'il est utile au cours du processus de traduction. Le logiciel qui traite les tNs utilisera les données d'alignement pour identifier les mots de votre traduction GL auxquels les notes individuelles font référence.

La section ci-dessus sur [Editing the tNs](https://git.door43.org/unfoldingWord/en_tn#editing-the-utn) peut vous donner des idées sur le logiciel à utiliser. Bien entendu, vous pouvez également convertir les fichiers TSV dans un autre format, effectuer la traduction, puis les reconvertir en fichiers TSV (veillez à ce que les identifiants soient préservés si vous faites cela). Suivez [Translate Content Online](https://help.door43.org/en/knowledgebase/15-door43-content-service/docs/41-translate-content-online) pour obtenir une copie de ce référentiel afin de commencer votre travail.

### Ajouter des notes

En tant que traducteur d'UTN dans un GL, vous pouvez avoir besoin de [add new notes](https://gl-manual.readthedocs.io/en/latest/gl_translation.html#may-i-add-a-note-that-would-help-with-translation-in-my-language). Suivez ces étapes pour le faire :

1. Ajoutez une nouvelle ligne dans l'ordre correct du livre, du chapitre et du verset.
2. Remplissez chaque champ de la rangée selon le [UTN TSV Column Description](https://git.door43.org/unfoldingWord/en_tn#utn-tsv-column-description) ci-dessus, en prenant note de ces instructions :

    * Choisissez un nouvel `ID` pour cette note, qui doit être unique parmi les notes du verset.
    * Si vous ne connaissez pas le grec, mettez le texte GL auquel la note fait référence dans le champ `GLQuote`. Demandez à un réviseur qui connaît le grec et votre GL de revenir et d'ajouter le texte approprié de l'UGNT auquel la note fait référence.

## Licence

Voir le fichier [LICENSE](https://git.door43.org/Bussard/fr_tn/src/branch/master/LICENSE.md) pour les informations sur la licence.
