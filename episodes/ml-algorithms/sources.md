# Sources — episode 02 (5 ML algorithms)

Checked 2026-10-10 against the scikit-learn user-guide sources
(`doc/modules/*.rst` on GitHub, main branch; scikit-learn.org itself was not
reachable from the render sandbox, so the same text was read from the
repository).

| Claim in the narration / on screen | Source | Supporting text |
|---|---|---|
| Linear Regression learns a straight-line relationship and predicts a number | `doc/modules/linear_model.rst` (Ordinary Least Squares) | "LinearRegression fits a linear model with coefficients w … to minimize the residual sum of squares between the observed targets … and the targets predicted by the linear approximation." |
| Logistic Regression estimates a probability and is used for classification «رغم اسمها» | `doc/modules/linear_model.rst` (Logistic regression) | "Despite its name, it is implemented as a linear model for classification rather than regression … the probabilities describing the possible outcomes … are modeled using a logistic function." |
| A Decision Tree is a chain of questions learned from data | `doc/modules/tree.rst` | "…predicts the value of a target variable by learning simple decision rules inferred from the data features." |
| Random Forest: several different trees, predictions combined by averaging | `doc/modules/ensemble.rst` (Random forests) | "The prediction of the ensemble is given as the averaged prediction of the individual classifiers." Trees differ because each "is built from a sample drawn with replacement (i.e., a bootstrap sample)" and splits use "a random subset of candidate features". "By taking an average of those predictions, some errors can cancel out." |
| K-Means: you choose the number of groups; no labels are given | `doc/modules/clustering.rst` (K-means) | "This algorithm requires the number of clusters to be specified." Clustering is unsupervised (no target labels are passed to `fit`). |

## Claims deliberately avoided

- No accuracy promise for Random Forest: the visual says «متوسط التوقّعات ≈ 160,000»
  (an estimate), and only that predictions are combined.
- The 50 % threshold in the Logistic gauge is labelled «حدّ القرار» and is the
  common default, not a rule; the 87 % is illustrative.
- All numbers (prices, areas, customers, probability) are fictional and
  labelled «أرقام توضيحية» / «مثال توضيحي» on screen.
- K-Means groups are named «مجموعة 1/2/3» (not "VIP", "occasional", …) because
  the algorithm does not produce meaningful labels by itself.
